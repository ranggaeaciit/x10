package controllers

import (
	. "eaciit/x10/webapps/connection"
	. "eaciit/x10/webapps/models"
	"strings"
	"time"

	"github.com/eaciit/cast"

	"errors"

	"github.com/eaciit/dbox"
	"github.com/eaciit/knot/knot.v1"
	tk "github.com/eaciit/toolkit"
)

type DashboardController struct {
	*BaseController
}

func (c *DashboardController) Default(k *knot.WebContext) interface{} {
	k.Config.NoLog = true
	k.Config.OutputType = knot.OutputTemplate
	DataAccess := c.NewPrevilege(k)

	k.Config.IncludeFiles = []string{
		"shared/dataaccess.html",
		"shared/loading.html",
		"shared/leftfilter.html",

		"dashboard/alert_summary.html",
		"dashboard/time_tracker.html",
		"dashboard/alert_sidebar.html",
	}

	return DataAccess
}

func (c *DashboardController) GetCurrentDate(k *knot.WebContext) interface{} {
	c.LoadBase(k)
	k.Config.OutputType = knot.OutputJson
	ret := ResultInfo{}
	dateNow := time.Now().Format("2006-01-02")
	timeNow := time.Now().Format("15:04:05")
	ret.Data = tk.M{}.Set("CurrentDate", dateNow).Set("CurrentTime", timeNow)
	return ret
}

func (c *DashboardController) GetBranch(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	conn, err := GetConnection()
	defer conn.Close()
	res := new(tk.Result)
	if err != nil {

		res.SetError(err)
		return err
	}

	query, err := conn.NewQuery().From("MasterAccountDetail").Cursor(nil)
	if err != nil {

		res.SetError(err)
		return err
	}
	results := []tk.M{}
	err = query.Fetch(&results, 0, false)
	defer query.Close()

	if err != nil {

		res.SetError(err)
		return err
	}

	if (len(results)) == 0 {
		return c.SetResultInfo(true, "data not found", nil)
	}

	data := results[0]
	result := []tk.M{}

	for _, val := range data["Data"].([]interface{}) {
		newdt, _ := tk.ToM(val)
		fl := newdt.GetString("Field")

		if fl == "Branch" {
			result = append(result, newdt)
		}

	}

	return &result
}

func (c *DashboardController) GetNotes(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	conn, err := GetConnection()
	if err != nil {
		res.SetError(err)
		return err
	}
	defer conn.Close()

	query, err := conn.NewQuery().Where(dbox.Eq("_id", k.Session("username").(string))).From(new(DashboardNoteModel).TableName()).Cursor(nil)
	if err != nil {

		res.SetError(err)
		return err
	}

	results := DashboardNoteModel{}
	err = query.Fetch(&results, 1, false)
	if err != nil {
		res.SetError(err)
		return err
	}
	defer query.Close()

	res.SetData(results)

	return res
}

func (c *DashboardController) SaveNotes(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := new(DashboardNoteModel)
	err := k.GetPayload(payload)
	if err != nil {
		return res.SetError(err)
	}

	cMongo, err := GetConnection()
	if err != nil {
		return res.SetError(err)
	}

	defer cMongo.Close()

	q := cMongo.NewQuery().SetConfig("multiexec", true).From(payload.TableName()).Save()

	defer q.Close()

	payload.Id = k.Session("username").(string)

	err = q.Exec(tk.M{"data": payload})
	if err != nil {
		return res.SetError(err)
	}

	res.SetData(payload)

	return res
}

func (c *DashboardController) GetFilter(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson

	res := new(tk.Result)

	conn, err := GetConnection()
	defer conn.Close()
	if err != nil {
		return res.SetError(err)
	}

	query, err := conn.NewQuery().From("DashboardFilter").Where(dbox.Eq("_id", k.Session("username").(string))).Cursor(nil)
	if err != nil {
		return res.SetError(err)
	}

	result := []DashboardFilterModel{}
	err = query.Fetch(&result, 0, false)
	defer query.Close()

	if err != nil {
		return res.SetError(err)
	}

	if len(result) == 0 {
		return c.SetResultInfo(true, "data not found", nil)
	}

	return c.SetResultInfo(false, "success", &result)
}

func (c *DashboardController) GetNotification(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	days := payload.GetInt("days")
	re, err := fetchNotification(days, "myInfo", k)
	if err != nil {
		return res.SetError(err)
	}
	rexnote, err := fetchNotesNotification(k)
	if err != nil {
		return res.SetError(err)
	}

	for _, val := range rexnote {
		re = append(re, val)
	}

	res.SetData(re)

	return res
}

func fetchNotesNotification(k *knot.WebContext) ([]string, error) {
	res := []string{}
	conn, err := GetConnection()
	if err != nil {
		return res, err
	}
	defer conn.Close()

	wh := dbox.Eq("_id", k.Session("username").(string))

	query, err := conn.NewQuery().Where(wh).From(new(DashboardNoteModel).TableName()).Cursor(nil)
	if err != nil {
		return res, err
	}

	results := DashboardNoteModel{}
	err = query.Fetch(&results, 1, false)
	if err != nil {
		return res, err
	}
	defer query.Close()

	yester := time.Now().AddDate(0, 0, -1)

	for _, val := range results.Comments {
		if !val.Checked && val.CreatedDate.Before(yester) {
			res = append(res, "To Do List Alert - "+val.Text+" created at "+cast.Date2String(val.CreatedDate, "yyyy-MM-dd HH:mm:ss"))
		}
	}

	return res, nil
}

func fetchNotification(days int, formtype string, k *knot.WebContext) ([]string, error) {
	res := []string{}

	until := time.Now().AddDate(0, 0, days*-1)
	now := time.Now()

	wh := dbox.And(dbox.Gte("info."+formtype+".updateTime", until), dbox.Lte("info."+formtype+".updateTime", now))

	if k.Session("CustomerProfileData") != nil {
		arrSes := k.Session("CustomerProfileData").([]tk.M)
		arrin := []interface{}{}
		for _, val := range arrSes {
			arrin = append(arrin, val.Get("_id"))
		}
		wh = dbox.And(wh, dbox.In("customerprofile._id", arrin...))
	}

	if k.Session("username") != nil {
		wh = dbox.And(wh, dbox.Ne("info.myInfo.updateBy", k.Session("username").(string)))
	}

	conn, err := GetConnection()
	if err != nil {
		return res, err
	}
	defer conn.Close()

	query, err := conn.NewQuery().Where(wh).From("DealSetup").Cursor(nil)
	if err != nil {
		return res, err
	}

	results := []tk.M{}
	err = query.Fetch(&results, 0, false)
	if err != nil {
		return res, err
	}
	defer query.Close()

	for _, val := range results {
		inf := val.Get("info").(tk.M)
		this := CheckArray(inf.Get(formtype))
		curr := this[len(this)-1]
		stat := curr.GetString("status")
		by := curr.GetString("updateBy")
		times := curr.Get("updateTime").(time.Time)

		if by == "" {
			by = "System"
		}

		cp := val.Get("customerprofile").(tk.M)
		dealno := strings.Split(cp.GetString("_id"), "|")[1]

		res = append(res, "Deal "+dealno+" has been "+stat+" at "+cast.Date2String(times, "yyyy-MM-dd HH:mm:ss")+" by "+by)
	}

	return res, nil
}

func (c *DashboardController) SummaryTrends(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	month := payload.GetString("month") // "February 2017"
	length := payload.GetInt("length")  // How far we look back
	currDate, err := time.Parse("2 January 2006 (MST)", "1 "+month+" (UTC)")
	if err != nil {
		return res.SetError(err)
	}
	nextDate := currDate.AddDate(0, 1, 0)
	pastDate := currDate.AddDate(0, 1-length, 0)

	pipe := []tk.M{}
	pipe = append(pipe, tk.M{"$lookup": tk.M{
		"from":         "DCFinalSanction",
		"localField":   "accountdetails.dealno",
		"foreignField": "DealNo",
		"as":           "dc",
	}})
	pipe = append(pipe, tk.M{"$project": tk.M{
		"dealno": "$accountdetails.dealno",
		"dc": tk.M{
			"$slice": []interface{}{"$dc", -1},
		},
		"info": tk.M{
			"$slice": []interface{}{"$info.myInfo", -1},
		},
	}})
	pipe = append(pipe, tk.M{"$unwind": "$info"})
	pipe = append(pipe, tk.M{"$unwind": tk.M{
		"path": "$dc",
		"preserveNullAndEmptyArrays": true,
	}})
	pipe = append(pipe, tk.M{"$project": tk.M{
		"dealno": "$dealno",
		"dc":     "$dc",
		"info":   "$info",
		"amount": tk.M{"$ifNull": []interface{}{"$dc.Amount", 0}},
	}})
	pipe = append(pipe, tk.M{"$match": tk.M{
		"info.updateTime": tk.M{
			"$gte": pastDate,
			"$lt":  nextDate,
		},
	}})
	pipe = append(pipe, tk.M{"$group": tk.M{
		"_id": tk.M{
			"status": "$info.status",
			"month":  tk.M{"$month": "$info.updateTime"},
			"year":   tk.M{"$year": "$info.updateTime"},
		},
		"totalAmount": tk.M{"$sum": "$amount"},
		"totalCount":  tk.M{"$sum": 1},
	}})
	pipe = append(pipe, tk.M{"$sort": tk.M{
		"_id.year":  -1,
		"_id.month": -1,
	}})
	pipe = append(pipe, tk.M{"$group": tk.M{
		"_id": tk.M{"status": "$_id.status"},
		"data": tk.M{
			"$push": tk.M{
				"totalAmount": "$totalAmount",
				"totalCount":  "$totalCount",
				"month":       "$_id.month",
				"year":        "$_id.year",
			},
		},
	}})

	csr, err := c.Ctx.Connection.
		NewQuery().
		Command("pipe", pipe).
		From("DealSetup").
		Cursor(nil)
	if err != nil {
		return res.SetError(err)
	}
	defer csr.Close()

	// dbdata := []struct {
	// 	ID   string `json:"_id"`
	// 	Data []struct {
	// 		Month       int     `json:"month"`
	// 		Year        int     `json:"year"`
	// 		TotalAmount float64 `json:"totalAmount"`
	// 		TotalCount  float64 `json:"totalCount"`
	// 	} `json:"data"`
	// }{}
	dbdata := []tk.M{}
	if err := csr.Fetch(&dbdata, 0, false); err != nil {
		return res.SetError(err)
	}

	res.SetData(dbdata)

	return res
}

func (c *DashboardController) TimeTrackerGridDetails(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	regionName := payload.GetString("regionname")
	timeStatus := payload.GetString("timestatus")
	stageName := payload.GetString("stagename")

	tk.Println("PAYLOAD", payload)

	branchIds := []string{}

	if regionName != "" {
		branchIds, err = GetBranchId(regionName)
		if err != nil {
			return res.SetError(err)
		}
	}

	pipe := []tk.M{}

	//set Role Access
	whRoles, err := GenerateRoleConditionTkM(k)
	if err != nil {
		return res.SetError(err)
	}

	Fwh := tk.M{}.Set("$and", whRoles)
	pipe = append(pipe, tk.M{}.Set("$match", Fwh))

	projfirst := tk.M{}
	projfirst.Set("laststatus", tk.M{"$arrayElemAt": []interface{}{"$info.myInfo.status", -1}})
	projfirst.Set("lastDate", tk.M{"$arrayElemAt": []interface{}{"$info.myInfo.updateTime", -1}})
	projfirst.Set("branch", "$accountdetails.accountsetupdetails.citynameid")
	projfirst.Set("caname", "$accountdetails.accountsetupdetails.creditanalyst")
	projfirst.Set("rmname", "$accountdetails.accountsetupdetails.rmname")
	projfirst.Set("dealno", "$accountdetails.dealno")
	projfirst.Set("custname", "$customerprofile.applicantdetail.CustomerName")

	proj := tk.M{}
	proj.Set("date", tk.M{"$dateToString": tk.M{"format": "%Y-%m-%d", "date": "$lastDate"}})
	proj.Set("status", "$laststatus")
	proj.Set("branch", 1)
	proj.Set("caname", 1)
	proj.Set("rmname", 1)
	proj.Set("dealno", 1)
	proj.Set("custname", 1)

	pipe = append(pipe, tk.M{"$project": projfirst})

	if len(branchIds) > 0 {
		pipe = append(pipe, tk.M{}.Set("$match", tk.M{}.Set("branch", tk.M{"$in": branchIds})))
	}

	if stageName != "" {
		pipe = append(pipe, tk.M{}.Set("$match", tk.M{}.Set("laststatus", tk.M{}.Set("$eq", stageName))))
	} else {
		pipe = append(pipe, tk.M{}.Set("$match", tk.M{}.Set("laststatus", tk.M{}.Set("$in", []interface{}{Inque, UnderProcess, OnHold, SendToDecision}))))
	}

	pipe = append(pipe, tk.M{"$project": proj})

	cn, err := GetConnection()
	if err != nil {
		return res.SetError(err)
	}

	defer cn.Close()

	csr, err := cn.NewQuery().
		Command("pipe", pipe).
		From("DealSetup").
		Cursor(nil)
	if err != nil {
		return res.SetError(err)
	}
	defer csr.Close()

	results := []tk.M{}
	err = csr.Fetch(&results, 0, false)
	if err != nil {
		return res.SetError(err)
	}

	// tk.Println("Result ---------", results)
	// tk.Println("Query ---------", pipe)

	period := tk.M{}
	period.Set(Inque, []int{-5, -4, 0})
	period.Set(UnderProcess, []int{-10, -4, 0})
	period.Set(SendToDecision, []int{-10, -4, 0})
	period.Set(OnHold, []int{-10, -4, 0})
	status := []string{"d*Over due", "c*Getting due", "b*In time", "a*New"}
	today := time.Now()

	finalRes := []tk.M{}
	k.SetSession("regionItems", nil)
	for _, val := range results {
		// id := val.Get("_id").(tk.M)
		mystatus := val.GetString("status")
		periodMe := period.Get(mystatus).([]int)

		for idx, peri := range periodMe {
			// id := val.Get("_id").(tk.M)
			mydate := cast.String2Date(val.GetString("date"), "yyyy-MM-dd")
			// mystatus := val.GetString("status")

			if regionName != "" {
				mystatus, err = GetRegionName(mystatus, k)
				if err != nil {
					return res.SetError(err)
				}
			}

			currPeriod := today.AddDate(0, 0, peri)

			if mydate.Before(currPeriod) {
				// tk.Println(mydate, currPeriod, timeStatus, status[idx])
				if status[idx] == timeStatus {
					finalRes = append(finalRes, val)
				}

				break
			}
		}
	}

	res.SetData(finalRes)

	return res
}

func GetBranchId(id string) ([]string, error) {
	res := []string{}
	items := []tk.M{}

	conn, err := GetConnection()
	defer conn.Close()
	if err != nil {
		return res, err
	}

	q, err := conn.
		NewQuery().
		Select().
		From("MasterAccountDetail").
		Cursor(nil)

	if err != nil {
		return res, err
	}

	// fetch one MasterAccountDetail data
	var account tk.M
	err = q.Fetch(&account, 1, true)
	if err != nil {
		return res, err
	}

	// casting to array of interface
	accData, ok := account.Get("Data").([]interface{})
	if !ok {
		return res, errors.New("Unable to access Data")
	}

	for _, val := range accData {
		v := val.(tk.M)
		if v.Get("Field") != "Branch" {
			continue
		}

		// found, populate with our data
		items = CheckArray(v.Get("Items"))
		break
	}

	for _, val := range items {
		if val.Get("region").(tk.M).GetString("name") == id {
			res = append(res, cast.ToString(val.GetInt("branchid")))
		}
	}

	return res, nil
}

func GetRegionName(id string, k *knot.WebContext) (string, error) {
	res := ""
	idint := cast.ToInt(id, cast.RoundingAuto)
	items := []tk.M{}

	if k.Session("regionItems") == nil {
		conn, err := GetConnection()
		defer conn.Close()
		if err != nil {
			return res, err
		}

		q, err := conn.
			NewQuery().
			Select().
			From("MasterAccountDetail").
			Cursor(nil)

		if err != nil {
			return res, err
		}

		// fetch one MasterAccountDetail data
		var account tk.M
		err = q.Fetch(&account, 1, true)
		if err != nil {
			return res, err
		}

		// casting to array of interface
		accData, ok := account.Get("Data").([]interface{})
		if !ok {
			return res, errors.New("Unable to access Data")
		}

		for _, val := range accData {
			v := val.(tk.M)
			if v.Get("Field") != "Branch" {
				continue
			}

			// found, populate with our data
			items = CheckArray(v.Get("Items"))
			break
		}
		k.SetSession("regionItems", items)

	} else {
		items = k.Session("regionItems").([]tk.M)
	}

	for _, val := range items {
		if val.GetInt("branchid") == idint {
			res = val.Get("region").(tk.M).GetString("name")
			break
		}
	}
	// tk.Println("-------------", res)
	return res, nil
}

func (c *DashboardController) SaveFilter(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson

	payload := DashboardFilterModel{}
	k.GetPayload(&payload)

	if payload.Id == "" {
		payload.Id = k.Session("username").(string)
	}

	if err := c.Ctx.Save(&payload); err != nil {
		return c.SetResultInfo(true, err.Error(), nil)
	}

	return c.SetResultInfo(false, "success", nil)

}

func (c *DashboardController) TimeTracker(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	groupBy := payload.GetString("groupby")
	regionName := payload.GetString("regionname")
	timeStatus := payload.GetString("timestatus")
	branchIds := []string{}

	if regionName != "" {
		branchIds, err = GetBranchId(regionName)
		if err != nil {
			return res.SetError(err)
		}
	}
	pipe := []tk.M{}

	//set Role Access
	whRoles, err := GenerateRoleConditionTkM(k)
	if err != nil {
		return res.SetError(err)
	}

	Fwh := tk.M{}.Set("$and", whRoles)
	pipe = append(pipe, tk.M{}.Set("$match", Fwh))

	projfirst := tk.M{}
	projfirst.Set("laststatus", tk.M{"$arrayElemAt": []interface{}{"$info.myInfo.status", -1}})
	projfirst.Set("lastDate", tk.M{"$arrayElemAt": []interface{}{"$info.myInfo.updateTime", -1}})
	projfirst.Set("branch", "$accountdetails.accountsetupdetails.citynameid")

	proj := tk.M{}
	proj.Set("date", tk.M{"$dateToString": tk.M{"format": "%Y-%m-%d", "date": "$lastDate"}})
	proj.Set("branchstatus", tk.M{"$concat": []interface{}{"$branch", "^", "$laststatus"}})
	proj.Set("status", "$laststatus")
	proj.Set("branch", 1)

	pipe = append(pipe, tk.M{"$project": projfirst})

	pipe = append(pipe, tk.M{}.Set("$match", tk.M{}.Set("laststatus", tk.M{}.Set("$in", []interface{}{Inque, UnderProcess, OnHold, SendToDecision}))))

	if len(branchIds) > 0 {
		pipe = append(pipe, tk.M{}.Set("$match", tk.M{}.Set("branch", tk.M{"$in": branchIds})))
	}

	pipe = append(pipe, tk.M{"$project": proj})

	groupfield := "$status"
	if groupBy == "region" {
		groupfield = "$branchstatus"
	}

	group := tk.M{}
	group.Set("_id", tk.M{"date": "$date", "status": groupfield})
	group.Set("count", tk.M{"$sum": 1})

	pipe = append(pipe, tk.M{"$group": group})

	cn, err := GetConnection()
	if err != nil {
		return res.SetError(err)
	}

	defer cn.Close()

	csr, err := cn.NewQuery().
		Command("pipe", pipe).
		From("DealSetup").
		Cursor(nil)
	if err != nil {
		return res.SetError(err)
	}
	defer csr.Close()

	// tk.Println(pipe)

	results := []tk.M{}
	err = csr.Fetch(&results, 0, false)
	if err != nil {
		return res.SetError(err)
	}

	// tk.Println("Result ---------+", results)

	period := tk.M{}
	period.Set(Inque, []int{-5, -4, 0})
	period.Set(UnderProcess, []int{-10, -4, 0})
	period.Set(SendToDecision, []int{-10, -4, 0})
	period.Set(OnHold, []int{-10, -4, 0})
	status := []string{"d*Over due", "c*Getting due", "b*In time", "a*New"}
	today := time.Now()
	// today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)

	finalRes := tk.M{}
	k.SetSession("regionItems", nil)
	for _, val := range results {
		id := val.Get("_id").(tk.M)
		mystatus := id.GetString("status")
		periodMe := []int{}

		if groupBy == "region" {
			mystatus = strings.Split(id.GetString("status"), "^")[0]
			periodMe = period.Get(strings.Split(id.GetString("status"), "^")[1]).([]int)
		} else {
			periodMe = period.Get(mystatus).([]int)
		}

		for idx, peri := range periodMe {
			mydate := cast.String2Date(id.GetString("date"), "yyyy-MM-dd")

			if groupBy == "region" {
				mystatus, err = GetRegionName(mystatus, k)
				if err != nil {
					return res.SetError(err)
				}
			}

			currPeriod := today.AddDate(0, 0, peri)

			if mydate.Before(currPeriod) {
				key := status[idx] + "|" + mystatus + "|" + cast.ToString(idx)
				if finalRes.Get(key) == nil {
					finalRes.Set(key, 0)
				}

				finalRes.Set(key, finalRes.Get(key).(int)+val.GetInt("count"))
				break
			}
		}
	}

	results = []tk.M{}
	for key, val := range finalRes {
		keyArr := strings.Split(key, "|")

		if timeStatus != "" {
			if timeStatus == keyArr[0] {
				results = append(results, tk.M{"timestatus": keyArr[0], "status": keyArr[1], "count": val, "order": cast.ToInt(keyArr[2], cast.RoundingAuto)})
			}
			continue
		}

		results = append(results, tk.M{"timestatus": keyArr[0], "status": keyArr[1], "count": val, "order": cast.ToInt(keyArr[2], cast.RoundingAuto)})
	}

	res.SetData(results)

	return res
}

func GenerateRoleConditionTkM(k *knot.WebContext) ([]tk.M, error) {
	dbFilter := []tk.M{}

	if k.Session("roles") == nil {
		return dbFilter, nil
	}

	roles := k.Session("roles").([]SysRolesModel)
	userid := k.Session("userid").(string)
	for _, Role := range roles {
		var dbFilterTemp []tk.M
		if !Role.Status {
			continue
		}

		Type := Role.Roletype
		Dealvalue := Role.Dealvalue

		Dv, err := new(LoginController).GetDealValue(Dealvalue)

		if err != nil {
			return dbFilter, err
		}

		if len(Dv) > 0 {
			curDv := Dv[0]
			opr := curDv.GetString("operator")
			var1 := curDv.GetFloat64("var1")
			var2 := curDv.GetFloat64("var2")

			switch opr {
			case "lt":
				dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$lt": var1}})
			case "lte":
				dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$lte": var1}})
			case "gt":
				dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$gt": var1}})
			case "gte":
				dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$gte": var1}})
			case "between":
				dbFilterTemp = append(dbFilterTemp, tk.M{"$and": []tk.M{tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$gte": var1}}, tk.M{"accountdetails.loandetails.proposedloanamount": tk.M{"$lte": var2}}}})
			}
		}
		tk.Printf("--------- DV %v ----------- \n", Dv)
		tk.Printf("--------- ROLETYPE %v ----------- \n", Type)
		tk.Printf("--------- USERID %v ----------- \n", userid)
		switch strings.ToUpper(Type) {
		case "CA":
			dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.accountsetupdetails.CreditAnalystId": tk.M{"$eq": userid}})
		case "RM":
			dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.accountsetupdetails.RmNameId": tk.M{"$eq": userid}})

		case "CUSTOM":
			all := []interface{}{}

			for _, valx := range Role.Branch {
				all = append(all, cast.ToString(valx))
			}
			if len(all) != 0 {
				dbFilterTemp = append(dbFilterTemp, tk.M{"accountdetails.accountsetupdetails.citynameid": tk.M{"$in": all}})
			} else {
				dbFilterTemp = append(dbFilterTemp, tk.M{"_id": tk.M{"$ne": ""}})
			}
		default:
			dbFilterTemp = append(dbFilterTemp, tk.M{"_id": tk.M{"$ne": ""}})
		}
		dbFilter = append(dbFilter, tk.M{"$and": dbFilterTemp})
	}

	return dbFilter, nil
}

func (c *DashboardController) MovingTAT(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	cn, err := GetConnection()
	if err != nil {
		return res.SetError(err)
	}
	defer cn.Close()

	whs, err := GenerateRoleCondition(k)
	if err != nil {
		return res.SetError(err)
	}

	query := cn.NewQuery().
		From("DealSetup").
		Where(dbox.And(whs...))

	csr, e := query.Cursor(nil)

	if e != nil {
		return res.SetError(err)
	}
	defer csr.Close()

	results := make([]tk.M, 0)
	e = csr.Fetch(&results, 0, false)
	if e != nil {
		return res.SetError(err)
	}

	textRange := []string{"15 + Days", "11 - 15 Days", "6 - 10 Days", "0 - 5 Days"}
	statusAlias := tk.M{SendBackOmnifin: "Re-Processed", Cancel: "Re-Processed", SendToDecision: "Processed", UnderProcess: "Accepted"}
	mapRes := tk.M{}
	for _, val := range results {
		info := val.Get("info").(tk.M)
		myInfo := CheckArray(info.Get("myInfo"))
		if len(myInfo) > 1 {
			for idx, inf := range myInfo {
				if idx+1 == len(myInfo) {
					continue
				}

				firstDate := inf.Get("updateTime").(time.Time)
				secondDate := myInfo[idx+1].Get("updateTime").(time.Time)
				status := myInfo[idx+1].GetString("status")

				year, month, day, _, _, _ := Diff(firstDate, secondDate)
				idxRange := 3
				if day > 15 || month > 0 || year > 0 {
					idxRange = 0
				} else if day >= 11 {
					idxRange = 1
				} else if day >= 6 {
					idxRange = 2
				}

				alias := statusAlias.GetString(status)

				if alias != "" {
					status = alias
				}

				key := status + "|" + textRange[idxRange]

				if mapRes.Get(key) == nil {
					mapRes.Set(key, 0)
				}

				mapRes.Set(key, mapRes.GetInt(key)+1)
			}
		}
	}

	finalRes := []tk.M{}
	for key, val := range mapRes {
		arr := strings.Split(key, "|")
		re := tk.M{}
		re.Set("status", arr[0])
		re.Set("dayrange", arr[1])
		re.Set("count", val)
		finalRes = append(finalRes, re)
	}

	res.SetData(finalRes)

	return res
}

func (c *DashboardController) HistoryTAT(k *knot.WebContext) interface{} {
	k.Config.OutputType = knot.OutputJson
	res := new(tk.Result)

	payload := tk.M{}
	err := k.GetPayload(&payload)
	if err != nil {
		return res.SetError(err)
	}

	cn, err := GetConnection()
	if err != nil {
		return res.SetError(err)
	}
	defer cn.Close()

	whs, err := GenerateRoleCondition(k)
	if err != nil {
		return res.SetError(err)
	}

	query := cn.NewQuery().
		From("DealSetup").
		Where(dbox.And(whs...))

	csr, e := query.Cursor(nil)

	if e != nil {
		return res.SetError(err)
	}
	defer csr.Close()

	results := make([]tk.M, 0)
	e = csr.Fetch(&results, 0, false)
	if e != nil {
		return res.SetError(err)
	}

	textRange := []string{"15 + Days", "11 - 15 Days", "6 - 10 Days", "0 - 5 Days"}
	mapRes := tk.M{}
	for _, val := range results {
		info := val.Get("info").(tk.M)
		myInfo := CheckArray(info.Get("myInfo"))

		inf := myInfo[len(myInfo)-1]

		firstDate := inf.Get("updateTime").(time.Time)
		secondDate := time.Now()
		status := inf.GetString("status")

		year, month, day, _, _, _ := Diff(firstDate, secondDate)
		idxRange := 3
		if day > 15 || month > 0 || year > 0 {
			idxRange = 0
		} else if day >= 11 {
			idxRange = 1
		} else if day >= 6 {
			idxRange = 2
		}

		key := status + "|" + textRange[idxRange]

		if mapRes.Get(key) == nil {
			mapRes.Set(key, 0)
		}

		mapRes.Set(key, mapRes.GetInt(key)+1)
	}

	finalRes := []tk.M{}
	for key, val := range mapRes {
		arr := strings.Split(key, "|")
		re := tk.M{}
		re.Set("status", arr[0])
		re.Set("dayrange", arr[1])
		re.Set("count", val)
		finalRes = append(finalRes, re)
	}

	res.SetData(finalRes)

	return res
}

func (c *DashboardController) TurnaroundTime(k *knot.WebContext) interface{} {
	k.Config.NoLog = true
	k.Config.OutputType = knot.OutputTemplate
	DataAccess := c.NewPrevilege(k)

	k.Config.IncludeFiles = []string{
		"shared/dataaccess.html",
		"shared/loading.html",
		"shared/leftfilter.html",
	}

	return DataAccess
}
