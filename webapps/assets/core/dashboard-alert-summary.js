
alertSum = {}

alertSum.height = function(){
    var myHeight = ($(window).height() - 90) / 3
    if (myHeight < 230)
        return 230;
    return myHeight;
}

alertSum.titleText = ko.computed(function () {
    var type = dash.FilterValue.GetVal("TimePeriod")
    var start = moment(dash.FilterValue.GetVal("TimePeriodCalendar"))
    var end = moment(dash.FilterValue.GetVal("TimePeriodCalendar2"))

    if (!start.isValid())
        return "-"

    switch (type) {
    case "10day":
        return start.clone().subtract(10, "day").format("DD MMM YYYY") + " - " + start.format("DD MMM YYYY")
    case "":
    case "1month":
        return start.format("MMMM YYYY")
    case "1year":
        return start.format("YYYY")
    case "fromtill":
        return start.format("DD MMM YYYY") + " - " + end.format("DD MMM YYYY")
    }
})

// Hook to filter value changes
dash.FilterValue.subscribe(function (val) {
    alertSum.trendDataAjaxRefresh()
})

alertSum.trendDataLengthOptions = ko.computed(function () {
    var unit = dash.FilterValue.GetVal("TimePeriod")
    switch (unit) {
    case "":
    case "1month":
        unit = "months"
        break;
    case "1year":
        unit = "years"
        break;
    default:
        unit = "period"
    }
    var ret =  _.map([3, 4, 6, 12], function (val) {
        return {
            text: "" + val + " " + unit,
            value: val
        }
    });

    return ret;
});

alertSum.trendDataLength = ko.observable(6);
alertSum.trendDataLength.subscribe(function () {
    alertSum.trendDataAjaxRefresh()
})
alertSum.trendDataLengthTitle = ko.computed(function () {
    return _.find(alertSum.trendDataLengthOptions(), function (val) {
        return val.value == alertSum.trendDataLength()
    }).text;
})

alertSum.trendDataSeries = ko.observableArray([]);
alertSum.trendDataCurrent = ko.observable();

alertSum.prepareTrendData = function (data, start, length) {
    var ret = []
    _.times(length, function(idx) {
        var obj = _.find(data, function(val) {
            return val.idx == idx
        })

        if (typeof(obj) == "undefined") {
            ret.push({
                idx: idx,
                totalAmount: 0,
                totalCount: 0
            })

            return
        }

        ret.push({
            idx: obj.idx,
            // convert to CR
            totalAmount: obj.totalAmount / 10000000,
            totalCount: obj.totalCount
        })
    })

    return ret
}

alertSum.mergeTrendData = function(data) {
    var ret = []
    _.each(data, function (wrap) {
        var name = wrap._id.status;
        _.each(wrap.data, function (val, key) {
            if (ret.length < (key + 1)) {
                ret.push({});
            }

            var el = ret[key]
            el["amount" + name] = val.totalAmount
            el["count" + name] = val.totalCount
        })
    })

    alertSum.trendDataCurrent(ret.shift())
    return ret
}

alertSum.generateXAxis = function (type, start, end, length) {
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

alertSum.trendDataAjaxRefresh = function() {
    var len = alertSum.trendDataLength();
    var start = discardTimezone(dash.FilterValue.GetVal("TimePeriodCalendar"))
    var end = discardTimezone(dash.FilterValue.GetVal("TimePeriodCalendar2"))
    var type = dash.FilterValue.GetVal("TimePeriod")

    $.ajax("/dashboard/summarytrends", {
        method: "post",
        data: JSON.stringify({
            type: type,
            start: start,
            end: end,
            length: len + 1,
            filter: dash.FilterValue()
        }),
        contentType: "application/json",
        success: function(body) {
            if (body.Status == "") {

                //normalize data
                _.map(body.Data, function (val) {
                    val.data = alertSum.prepareTrendData(val.data, start, len + 1)
                })
                //merge data
                var merge = alertSum.mergeTrendData(body.Data)
                alertSum.trendDataSeries(merge)
                //generate label
                var months = alertSum.generateXAxis(type, start, end, len + 1)
                months.shift()
                alertSum.trendDataMonths(months)
                return
            }
        }
    })
}

alertSum.trendDataConfig = [
    {
        type: 'column',
        name: 'Amount Approved',
        field: 'amountApproved',
        axis: 'cr',
    },
    {
        type: 'column',
        name: 'Amount Rejected',
        field: 'amountRejected',
        axis: 'cr'
    },
    {
        type: 'line',
        name: 'Deal Approved',
        field: 'countApproved',
        axis: 'count'
    },
    {
        type: 'line',
        name: 'Deal Rejected',
        field: 'countRejected',
        axis: 'count'
    }
]

alertSum.trendDataMonths = ko.observableArray([]);

alertSum.summary2fa = function (values) {
    if (values == 0)
        return "";
    if (values < 0)
        return "fa fa-caret-down";
    if (values > 0)
        return "fa fa-caret-up";
}

alertSum.summary2color = function (values) {
    if (values == 0)
        return "fa-font-neutral";
    if (values < 0)
        return "fa-font-red";
    if (values > 0)
        return "fa-font-green";
}

alertSum.seriesMax = function (sections) {
    var n = _.reduce(sections, function (max, val) {
        return Math.max(
            max,
            _.get(_.maxBy(alertSum.trendDataSeries(), val), val, 0)
        )
    }, 0)

    if (isNaN(n))
        return 0
    
    return n
}

alertSum.trendDataAxes = ko.computed(function () {
    return [{
        name: 'cr',
        title: { 
            text: 'Deal Amount',
            font: '11px sans-serif',
            color: '#4472C4' 
        },
        min: 0,
        max: Math.ceil(alertSum.seriesMax(['amountApproved', 'amountRejected']) + 1),
        majorUnit: 1,
        
    },{
        name: 'count',
        title: { 
            text: 'Deal Account',
            font: '11px sans-serif',
            color: '#4472C4'
        },
        min: 0,
        max: alertSum.seriesMax(['countApproved', 'countRejected']) + 2,
        majorUnit: 1,
    }]
})
alertSum.trendDataAxes.subscribe(function (val) {
    var el = $("#alert-summary").data("kendoChart");
    if (typeof(el) === "undefined")
        return
    
    el.setOptions({
        valueAxes: val
    })
})

alertSum.seriesChange = function(section) {
    return ko.computed(function() {
        var series = alertSum.trendDataSeries()
        if (series.length < 1)
            return 0;
        return _.get(alertSum.trendDataCurrent(), section, 0) - _.get(series[0], section, 0);
    })
}
alertSum.seriesChangePercent = function(section) {
    return ko.computed(function() {
        var series = alertSum.trendDataSeries()
        if (series.length < 1)
            return 0;
        if (_.get(series[0], section, 0) == 0)
            return _.get(alertSum.trendDataCurrent(), section, 0) * 100;
        return (_.get(alertSum.trendDataCurrent(), section, 0) - _.get(series[0], section, 0)) / _.get(series[0], section, 0) * 100;
    })
}
alertSum.seriesChangeFa = function(section) {
    return ko.computed(function() {
        return alertSum.summary2fa(alertSum.seriesChange(section)());
    })
}
alertSum.colorClass = function(section) {
    return ko.computed(function() {
        return alertSum.summary2color(alertSum.seriesChange(section)());
    })
}

alertSum.currentData = function(section, rounding = 0) {
    return ko.computed(function () {
        var num = _.get(alertSum.trendDataCurrent(), section, 0)


        return kendo.toString(num, "n" + rounding);
    })
}