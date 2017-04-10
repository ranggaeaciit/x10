var pm = {};
pm.trendDataMonths = ko.observableArray([]);
pm.dealCount = ko.observable(0);
pm.dealAmount = ko.observable(0);
pm.interestAmount = ko.observable(0);
pm.avgCount = ko.observable(0);
pm.avgAmount = ko.observable(0);
pm.avgInterestAmount = ko.observable(0);
pm.dummyData = ko.observableArray([]);

pm.dealCountList = ko.observableArray([
    {id: ko.observable(1), xflcount : ko.observable(0), xflcountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(2), xflcount : ko.observable(0), xflcountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(3), xflcount : ko.observable(0), xflcountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(4), xflcount : ko.observable(0), xflcountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(5), xflcount : ko.observable(0), xflcountwidth : ko.observable(0), xflcolor : ko.observable("")}
]);

pm.dealAmountList = ko.observableArray([
    {id: ko.observable(1), xflamount : ko.observable(0), xflamountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(2), xflamount : ko.observable(0), xflamountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(3), xflamount : ko.observable(0), xflamountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(4), xflamount : ko.observable(0), xflamountwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(5), xflamount : ko.observable(0), xflamountwidth : ko.observable(0), xflcolor : ko.observable("")}
]);

pm.dealInterestList = ko.observableArray([
    {id: ko.observable(1), xflinterest : ko.observable(0), xflinterestwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(2), xflinterest : ko.observable(0), xflinterestwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(3), xflinterest : ko.observable(0), xflinterestwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(4), xflinterest : ko.observable(0), xflinterestwidth : ko.observable(0), xflcolor : ko.observable("")},
    {id: ko.observable(5), xflinterest : ko.observable(0), xflinterestwidth : ko.observable(0), xflcolor : ko.observable("")}
]);

/*pm.xfl1amount = ko.observable(0);
pm.xfl2amount = ko.observable(0);
pm.xfl3amount = ko.observable(0);
pm.xfl4amount = ko.observable(0);
pm.xfl5amount = ko.observable(0);
pm.xfl1amountwidth = ko.observable(0);
pm.xfl2amountwidth = ko.observable(0);
pm.xfl3amountwidth = ko.observable(0);
pm.xfl4amountwidth = ko.observable(0);
pm.xfl5amountwidth = ko.observable(0);*/

/*pm.xfl1interest = ko.observable(0);
pm.xfl2interest = ko.observable(0);
pm.xfl3interest = ko.observable(0);
pm.xfl4interest = ko.observable(0);
pm.xfl5interest = ko.observable(0);
pm.xfl1interestwidth = ko.observable(0);
pm.xfl2interestwidth = ko.observable(0);
pm.xfl3interestwidth = ko.observable(0);
pm.xfl4interestwidth = ko.observable(0);
pm.xfl5interestwidth = ko.observable(0);*/



// set to show up dealstatus
dash.showOptionalFilter("DealStatus")

pm.dataPeriod = ko.observableArray([
    { text: 'Period', value: 'period' },
    { text: 'Region', value: 'region' },
]);
pm.ValueDataPeriod = ko.observable('');

pm.dataMenu = ko.observableArray([
    { text: 'Deal Count', value: 'count' },
    { text: 'Deal Mount', value: 'mount' },
    { text: 'Interest Amount', value: 'interest' },
]);

pm.ValueDataMenu = ko.observable('');

/*pm.loadAllHeadChart = function(){
    pm.Count();
    pm.Mount();
    pm.Interest();
}
*/
pm.Target = function() {
    $("#tatgoals").html('')
    $("#tatgoals").kendoRadialGauge({
        pointer: {
            value: 6
        },

        scale: {
            minorUnit: 5,
            startAngle: -30,
            endAngle: 210,
            max: 30,
            majorTicks: {
                size: 5
            },
            labels: {
                position: "inside"
            },
            ranges: [{
                from: 0,
                to: 10,
                color: "green"
            }, {
                from: 10,
                to: 20,
                color: "yellow"
            }, {
                from: 20,
                to: 30,
                color: "red"
            }]
        }
    });
}

/*pm.Count = function(){
    $("#count").html("")
    $("#count").kendoChart({
        title: {
            visible: false
        },
        // dataSource: ds,
        legend: {
            visible: false
        },
        chartArea: {
            background: "",
            width: 300,
            height: 200
        },
        seriesDefaults: {
            type: "donut",
            holeSize: 50,
            startAngle: 150,
        },
        series: [{
            type: "donut",
            data: [{
                category: "Football",
                value: 35
            }, {
                category: "Basketball",
                value: 25
            }, {
                category: "Volleyball",
                value: 20
            }, {
                category: "Rugby",
                value: 10
            }, {
                category: "Tennis",
                value: 10
            }],
            overlay: {
                gradient: "none"
            },
        }],
        tooltip: {
            visible: true,
            template: "#= category # (#= series.name #): #= value #%"
        }
    });

    var text = "<span style='font-size: 43px;font-weight: bold;'>30</span><br><div id='coba' style='margin-top: -42%;'><span class='fa fa-arrow-up'></span> 30%</div>"
    $(".count-text").append(text);
}

pm.Mount = function(){
    $("#amount").html('');
    $("#amount").kendoChart({
        title: {
            visible: false
        },
        // dataSource: ds,
        legend: {
            visible: false
        },
        chartArea: {
            background: "",
            width: 300,
            height: 200
        },
        seriesDefaults: {
            type: "donut",
            holeSize: 50,
            startAngle: 150,
        },
        series: [{
            type: "donut",
            data: [{
                category: "Football",
                value: 35
            }, {
                category: "Basketball",
                value: 25
            }, {
                category: "Volleyball",
                value: 20
            }, {
                category: "Rugby",
                value: 10
            }, {
                category: "Tennis",
                value: 10
            }],
            overlay: {
                gradient: "none"
            },
        }],
        tooltip: {
            visible: true,
            template: "#= category # (#= series.name #): #= value #%"
        }
    });

    var text = "<span style='font-size: 43px;font-weight: bold;'>30</span><span>Cr.</span> <br><div id='coba' style='margin-top: -42%;'><span class='fa fa-arrow-up'></span> 30%</div>"
    $(".amount-text").append(text);
}

pm.Interest = function(){
    $("#interest").html("");
    $("#interest").kendoChart({
        title: {
            visible: false
        },
        // dataSource: ds,
        legend: {
            visible: false
        },
        chartArea: {
            background: "",
            width: 300,
            height: 200
        },
        seriesDefaults: {
            type: "donut",
            holeSize: 50,
            startAngle: 150,
        },
        series: [{
            type: "donut",
            data: [{
                category: "Football",
                value: 35
            }, {
                category: "Basketball",
                value: 25
            }, {
                category: "Volleyball",
                value: 20
            }, {
                category: "Rugby",
                value: 10
            }, {
                category: "Tennis",
                value: 10
            }],
            overlay: {
                gradient: "none"
            },
        }],
        tooltip: {
            visible: true,
            template: "#= category # (#= series.name #): #= value #%"
        }
    });

    var text = "<span style='font-size: 43px;font-weight: bold;'>30</span><span>Cr.</span> <br><div id='coba' style='margin-top: -42%;'><span class='fa fa-arrow-up'></span> 30%</div>"
    $(".interest-text").append(text);
}*/

pm.loadContainer = function() {
    $("#chartContainer").html('')
    $("#chartContainer").kendoChart({
        // theme: "Material",
        title: { 
            text: "Deal Amount and Interest",
            font:  "12px Arial,Helvetica,Sans-Serif",
            align: "left",
            color: "#58666e",
            padding: {
                top: 0
            }
        },
        plotArea: {
            margin: {
                right: 4,
            }
        },
        dataSource: pm.dummyData(),
        series: [{
            type: "column",
            stack: false,
            field: "interest",
            color: '#2e75b6',
            overlay: {
                gradient: "none"
            },
            name: "Interest"
        }, {
            type: "column",
            stack: false,
            field: "amount",
            color: '#00b0f0',
            overlay: {
                gradient: "none"
            },
            name: "Deal Amount"
        }, {
            type: "line",
            stack: false,
            field: "count",
            axis: "dc",
            dashType: "dot",
            color: '#ffc000',
            name: "Deal Count"
        }, {
            // field: "wind",
            name: "Target"
        }],
        chartArea: {
            height: 250,
            background: "white"
        },
        legend: {
            visible: true,
            position: "bottom",
            labels: {
                font: "10px Arial,Helvetica,Sans-Serif"
            }
        },
        valueAxes: [{
            title: {
                text: "Amount (Rs. Lacs)",
                font: "10px sans-serif",
                color: "#4472C4",
                margin: {
                    right: 1,
                }
            },
            labels: {
                font: "10px sans-serif",
                step: 2,
                skip: 2
            },
            min: 0,
            // max: 10,
            plotBands: [{
                from: 2.9,
                to: 3.0,
                color: "#70ad47",
                name: "Target"
            }]
        }, {
            name: "dc",
            title: {
                text: "Deal Count",
                font: "11px sans-serif",
                color: "#4472C4",
                margin: {
                    left: 1,
                }
            },
            min: 0,
            max: 10,
            labels: {
                font: "10px sans-serif",
                step: 2,
                skip: 2
            },
        }],
        categoryAxis: {
            categories: pm.trendDataMonths(),
            /*field: "dateStr",
            title : {
                 text : "Time Period",
                font: "11px sans-serif",
                visible : true,
                color : "#4472C4",
                margin: {
                    left: 1,
                }
            },
            labels : {
                font: "10px sans-serif",
            },*/
            axisCrossingValues: [0, 7]
        },
        tooltip: {
            visible: true,
            template: function(dt) {
                if (dt.series.field == "count") {
                    return "Date: " + moment(dt.dataItem.period).format("YYYY-MM-DD") + "<br>Deal Count: " + kendo.toString(dt.value, "n0");
                }else if (dt.series.field == "amount"){
                    return "Date: " + moment(dt.dataItem.period).format("YYYY-MM-DD") + "<br>Amount: " + kendo.toString(dt.value, "n0");
                }else if ((dt.series.field == "interest")){
                    return "Date: " + moment(dt.dataItem.period).format("YYYY-MM-DD") + "<br>Interest: " + kendo.toString(dt.value, "n0");
                }
                return;
            }
        }
    });
}

pm.accordion = function() {
    $(".toggle1").click(function(e) {
        e.preventDefault();

        var $this = $(this);
        if ($this.next().children().hasClass('show')) {
            $this.next().children().removeClass('show');
            $this.next().children().slideUp(500);
            $this.find("h5>.ic").removeClass("acc-down");
            $this.find("h5>.ic").addClass("acc-up");

        } else {
            $this.next().children().removeClass('hide');
            $this.next().children().slideDown(500);
            $this.next().children().addClass("show");
            $this.find("h5>.ic").addClass("acc-down");
            $this.find("h5>.ic").removeClass("acc-up");
        }
    })
}

pm.setTitle = function() {
    var start = cleanMoment(dash.FilterValue.GetVal("TimePeriodCalendar"))
    var end = cleanMoment(dash.FilterValue.GetVal("TimePeriodCalendar2"))
    var type = dash.FilterValue.GetVal("TimePeriod")
    var title = "All";

    if (type == "10day") {
        title = "Last 10 Days"
    } else if (type == "1month") {
        start = moment(start).format("MMM-YYYY")
        end = moment(end).format("MMM-YYYY")
        title = start
    } else if (type == "1year") {
        start = moment(start).format("YYYY")
        end = moment(start).add(1, "years").format("YYYY")
        title = start + " - " + end
    } else if (type == "fromtill") {
        start = moment(start).format("DD-MMM-YYYY")
        end = moment(end).format("DD-MMM-YYYY")
        title = start + " - " + end
    }

    return title;
}

// pm.setTitle = function(){
//  var title = kendo.toString(new Date(pm.titleText()), "MMM 'yy");
//  return title;
// }

pm.loadChaterChart = function() {
    var data = [
        [20, 23],
        [40, 27]
    ];
    $(".cater").html("");
    $(".cater").kendoChart({
        title: {
            text: "Deal Amount vs. Credit Scores",
            font: "12px Arial,Helvetica,Sans-Serif",
            align: "left",
            color: "#58666e",
            padding: {
                top: 0
            }

        },
        chartArea: {
            height: 250,
            background: "white"
        },
        seriesDefaults: {
            type: "scatter",
            labels: {
                visible: true
            }
        },
        series: [{
            name: "Data",
            data: data
        }],
        legend: {
            visible: false,
        },
        xAxis: {
            max: 50,
            title: {
                // text: "Credit Scores",
                font: "11px sans-serif",
                visible: true,
                color: "#4472C4"
            },
            labels: {
                template: "&lt;= #= value #",
                skip: 1,
                step: 1,
                font: "10px sans-serif",
            },
            majorUnit: 10,
            minorUnit: 20,
            majorTicks: {
                visible: false
            },
            majorGridLines: {
                visible: false
            },
            minorTicks: {
                visible: true
            },
            minorGridLines: {
                visible: true
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: "Deal Amount",
                font: "10px sans-serif",
                visible: true,
                color: "#4472C4",
                padding: {
                    left: 0,
                    right: 0
                }
            },
            labels: {
                // template : "#: kendo.toString( value/100000 , 'n0')#",
                font: "10px sans-serif",
            }
        }
    });
}

pm.normalisasiData = function(data) {
    var category = [];
    var comdata = [];
    var lengcomdata = 0;
    var group = [];
    //each category maybe have different number of group, make it all same number
    for (var i in data) {
        if (category.indexOf(data[i].status) == -1) {
            category.push(data[i].status);
        }
        if (group.indexOf(data[i].timestatus) == -1) {
            group.push(data[i].timestatus);
        }
    }

    lengcomdata = group.length;
    //add dummy data if in some category, group number is different 
    for (var i in category) {
        var d = _.filter(data, function(x) {
            return x.status == category[i] });
        if (d.length < lengcomdata) {
            for (var x in group) {
                if (_.find(d, function(g) {
                        return g.timestatus == group[x] }) == undefined) {
                    data.push({
                        "status": category[i],
                        "timestatus": group[x],
                        "count": null,
                    });
                }
            }
        }
    }
    // console.log(data)
    return data
}

pm.Distribution = function() {
    var data = [{ "count": 1, "order": 1, "status": "Under Process", "timestatus": "c*Getting due" }];
    var datas = pm.normalisasiData(data)

    var myHeight = ($(window).height() - 90) / 3

    datas = _.sortBy(datas, ["status"])

    var stocksDataSource = new kendo.data.DataSource({
        data: datas,
        group: {
            field: "timestatus"
        },
    });
    $("#distribution").html("");
    $("#distribution").kendoChart({
        title: {
            text: "Deal Amount / Count vs. Interest Rate",
            align: "left",
            font: "12px Arial,Helvetica,Sans-Serif",
            align: "left",
            color: "#58666e",
            padding: {
                top: 0
            }
        },
        plotArea: {
            margin: {
                right: 4,
            }
        },
        dataSource: stocksDataSource,
        series: [{
            type: "column",
            stack: true,
            field: "count",
            name: "#= group.value.split('*')[1] #"
        }],
        chartArea: {
            height: 250,
            background: "white"
        },
        // seriesClick : function(e){
        //     var status = e.dataItem.timestatus.split("*")[1];
        //     if(status == "Over due"){
        //         ttrack.popupchartcolor(["#FF0000"]);
        //     }else if( status == "New"){
        //         ttrack.popupchartcolor(["#4472C4"]);
        //     }else if(status == "Getting due"){
        //         ttrack.popupchartcolor(["#FFC000"]);
        //     }else if(status == "In time"){
        //         ttrack.popupchartcolor(["#70AD47"])
        //     }
        //     var str = e.dataItem.status+" : "+status+" Deals accross Stages";
        //     var gstr = "In Queue : "+ status+ " Deals"
        //     ttrack.modalGridTittle(gstr);

        //     ttrack.modalChartTittle(str);
        //     if(ttrack.trackingValue() == 'stages'){
        //         ttrack.loadDataStages(e);
        //     }else if(ttrack.trackingValue() == 'region'){
        //         ttrack.loadDataRegion(e);
        //     }
        // },
        legend: {
            visible: true,
            position: "bottom",
            labels: {
                font: "10px Arial,Helvetica,Sans-Serif"
            }
        },
        // seriesColors : ttrack.chartcolors,
        valueAxis: {
            labels: {
                // format: "${0}",
                font: "10px sans-serif",
                skip: 2,
                step: 2,
            },
            title: {
                text: "No. of Deals",
                font: "11px sans-serif",
                visible: true,
                color: "#4472C4",
                margin: {
                    right: 1,
                }
            }
        },
        categoryAxis: {
            field: "status",
            title: {
                text: "Deal Stages",
                font: "11px sans-serif",
                visible: true,
                color: "#4472C4"
            },
            labels: {
                font: "10px sans-serif",
            }
        },
        tooltip: {
            visible: true,
            template: function(dt) {
                return dt.dataItem.timestatus.split("*")[1] + " : " + dt.value
            }
        }
    });
}

pm.generateXAxis = function(type, start, end, length) {
    var cur = cleanMoment(start)
    var till = cleanMoment(end)
    var ret = []

    switch (type) {
        case "":
        case "1month":
            cur.day(1);
            _.times(length, function() {
                ret.push(cur.format('MMM `YY'))
                cur.subtract(1, 'months')
            })
            break;
        case "1year":
            cur.day(1);
            cur.month(4);
            _.times(length, function() {
                ret.push(cur.format('YYYY'))
                cur.subtract(1, 'year')
            })
            break;
        case "fromtill":
            var days = till.diff(cur, "days") + 1

            _.times(length, function() {
                ret.push(
                    cur.format('DD/MM') + " - " + till.format('DD/MM')
                );
                cur.subtract(days, "days")
                till.subtract(days, "days")
            })
            break;
        case "10day":
            _.times(length, function() {
                ret.push(
                    cur.format('DD/MM/YY') + " - " + cur.clone().subtract(10, "days").format('DD/MM/YY')
                );
                cur.subtract(10, "days")
            })
            break;
        default:
            _.times(length, function() {
                ret.push("");
            })
            break;
    }

    return ret
}

pm.init = function() {
    pm.trendDataMonths([]);
    pm.dummyData([]);
    var param = {
        type: dash.FilterValue.GetVal("TimePeriod"),
        start: cleanMoment(dash.FilterValue.GetVal("TimePeriodCalendar")),
        end: cleanMoment(dash.FilterValue.GetVal("TimePeriodCalendar2")),
        filter: dash.FilterValue()
    }
    if (param.filter != undefined) {
        ajaxPost("/dashboard/metricstrend", param, function(res) {
            pm.dealCount(res.Data.topwidget.count);
            pm.dealAmount(kendo.toString(res.Data.topwidget.amount, "n"));
            pm.interestAmount(kendo.toString(res.Data.topwidget.interest, "n"));
            pm.avgCount(kendo.toString(res.Data.topwidget.avgCount, "n"));
            pm.avgAmount(kendo.toString(res.Data.topwidget.avgAmount, "n"));
            pm.avgInterestAmount(kendo.toString(res.Data.topwidget.avgInterest, "n"));

            // XFL
            _.each(res.Data.xfl, function(v, k) {
                var o = {}
                switch (v.xfl) {
                    case "XFL-1":
                        o.id = 1;
                        o.xflcount = v.count;
                        o.xflcountwidth = kendo.toString(v.countwidth, "n0");
                        o.xflamountwidth = kendo.toString(v.amountwidth, "n0");
                        o.xflamount = kendo.toString(v.amount, "n");
                        o.xflinterestwidth = kendo.toString(v.interestwidth, "n0");
                        o.xflinterest = kendo.toString(v.interest, "n");
                        break;
                    case "XFL-2":
                        o.id = 2;
                        o.xflcount = v.count ;
                        o.xflcountwidth = kendo.toString(v.countwidth, "n0");
                        o.xflamountwidth = kendo.toString(v.amountwidth, "n0");
                        o.xflamount = kendo.toString(v.amount, "n");
                        o.xflinterestwidth = kendo.toString(v.interestwidth, "n0");
                        o.xflinterest = kendo.toString(v.interest, "n");
                        break;
                    case "XFL-3":
                        o.id = 3;
                        o.xflcount = v.count;
                        o.xflcountwidth = kendo.toString(v.countwidth, "n0");
                        o.xflamountwidth = kendo.toString(v.amountwidth, "n0");
                        o.xflamount = kendo.toString(v.amount, "n");
                        o.xflinterestwidth = kendo.toString(v.interestwidth, "n0");
                        o.xflinterest = kendo.toString(v.interest, "n");
                        break;
                    case "XFL-4":
                        o.id = 4;
                        o.xflcount = v.count;
                        o.xflcountwidth = kendo.toString(v.countwidth, "n0");
                        o.xflamountwidth = kendo.toString(v.amountwidth, "n0");
                        o.xflamount = kendo.toString(v.amount, "n");
                        o.xflinterestwidth = kendo.toString(v.interestwidth, "n0");
                        o.xflinterest = kendo.toString(v.interest, "n");
                        break;
                    case "XFL-5":
                        o.id = 5;
                        o.xflcount = v.count;
                        o.xflcountwidth = kendo.toString(v.countwidth, "n0");
                        o.xflamountwidth = kendo.toString(v.amountwidth, "n0");
                        o.xflamount = kendo.toString(v.amount, "n");
                        o.xflinterestwidth = kendo.toString(v.interestwidth, "n0");
                        o.xflinterest = kendo.toString(v.interest, "n");
                        break;
                }
                _.each(pm.dealCountList(), function(v, k){
                    if (v.id() == o.id) {
                        v.xflcount(o.xflcount);
                        v.xflcountwidth(o.xflcountwidth);
                    }
                });

                _.each(pm.dealAmountList(), function(v, k){
                    if (v.id() == o.id) {
                        v.xflamount(o.xflamount);
                        v.xflamountwidth(o.xflamountwidth);
                    }
                });

                _.each(pm.dealInterestList(), function(v, k){
                    if (v.id() == o.id) {
                        v.xflinterest(o.xflinterest);
                        v.xflinterestwidth(o.xflinterestwidth);
                    }
                });
            });
            

            // sort by idx
            res.Data.chart = _.without(res.Data.chart, _.find(res.Data.chart, function(e) {
                return e.idx == 0;
            }));
            //generate label
            var months = pm.generateXAxis(param.type, param.start, param.end, 7);
            months.shift();
            pm.trendDataMonths(months);
            pm.dummyData(_.sortBy(res.Data.chart, "idx"))
            pm.loadContainer();
        });
    }
}

// Hook to filter value changes
dash.FilterValue.subscribe(function(val) {
    pm.init();
});

$(function() {
    // pm.init();
    pm.loadChaterChart();
    pm.Target();
    pm.Distribution();
    pm.accordion();
    // pm.loadAllHeadChart();
    // $('.tooltipdealcount').tooltipster({
    //     /*animation: 'fade',
    //     delay: 100*/
    //     functionInit: function(instance, helper){
    //         console.log(instance, instance.title)
    //         // // parse the content
    //         // var content = instance.content(),
    //         //     people = JSON.parse(content),
    //         //     // and use it to make a sentence
    //         //     newContent = 'We have ' + people.length + ' people today. Say hello to ' + people.join(', ');
            
    //         // // save the edited content
    //         // instance.content(newContent);
    //     }
    // });
    $('.tooltipdealcount').tooltipster();
});
