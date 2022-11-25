// set the dimensions and margins of the graph
var margin = { top: 30, right: 40, bottom: 70, left: 70 },
    width = 760 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


var parseDate = d3.timeParse('%Y-%m-%d');

// color variables for each city
var houstonColor = "#ff99cc";
var nycColor = "#00cc99";
var seattleColor = "#0099ff";

Promise.all([
    d3.csv("KHOU.csv"),
    d3.csv("KNYC.csv"),
    d3.csv("KSEA.csv")
]).then(function (data) {

    //Parsing the dates for each dataset
    data[0].forEach(function (d) {
        d.date = parseDate(d.date);
    });
    data[1].forEach(function (d) {
        d.date = parseDate(d.date);
    });
    data[2].forEach(function (d) {
        d.date = parseDate(d.date);
    });


    // x scale and axis
    var x = d3.scaleTime()
        .domain(d3.extent(data[0], function (d) { return d.date; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")))

    var xAxisLabel = svg.append("text")
        .text("Month")
        .attr("x", width / 2 - 25)
        .attr("y", height + 50)
        .style('fill', '#4c89c7');

    // y scale and axis
    var y = d3.scaleLinear()
        .domain([-15, 110])
        .range([height, 0]);
    var yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    var yAxisLabel = svg.append("text")
        .text("Average Temperature Since 1880 (F)")
        .attr("text-color", "blue")
        .attr("x", -(height - 100))
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .style('fill', '#4c89c7');


    // high and low area: defaults to houston
    var highLowRange = svg.append("path")
        .datum(data[0])
        .attr("fill", houstonColor)
        .attr("stroke", "none")
        .attr("d", d3.area()
            .x(function (d) { return x(d.date) })
            .y0(function (d) { return y(d.average_max_temp) })
            .y1(function (d) { return y(d.average_min_temp) })
        );

    // record low and high lines
    var recordHighLine = svg.append("g")
        .append("path")
        .datum(data[0])
        .attr("fill", "none")
        .attr("stroke", houstonColor)
        .attr("opacity", "0.4")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.record_max_temp); })
        );

    var recordLowLine = svg.append("g")
        .append("path")
        .datum(data[0])
        .attr("fill", "none")
        .attr("stroke", houstonColor)
        .attr("opacity", "0.4")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.record_min_temp); })
        );

    ///////////////////////////// tooltip
    // i referenced this example: https://jsfiddle.net/ringstaff/dL1qp1t6/ 
    var hoverLineGroup = svg.append("g")
        .attr("class", "hover-line")

    var hoverLine = hoverLineGroup
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .attr("x1", 0).attr("x2", 0)
        .attr("y1", 0).attr("y2", height);

    var hoverText = hoverLineGroup.append('text')
        .attr("font-size", "12px")
        .attr("class", "hover-text")
        .attr("dy", "0em")

    var hoverText2 = hoverLineGroup.append('text')
        .attr("font-size", "12px")
        .attr("class", "hover-text")
        .attr("dy", "1em");

    var hoverText3 = hoverLineGroup.append('text')
        .attr("font-size", "12px")
        .attr("class", "hover-text")
        .attr("dy", "2em");

    var hoverText4 = hoverLineGroup.append('text')
        .attr("font-size", "12px")
        .attr("class", "hover-text")
        .attr("dy", "3em");

    var hoverText5 = hoverLineGroup.append('text')
        .attr("font-size", "12px")
        .attr("class", "hover-text")
        .attr("dy", "4em");


    svg.on("mouseout", hoverMouseOff)
        .on("mousemove", hoverMouseOn);

    var bisectDate = d3.bisector(function (d) {
        return d.date;
    }).left;

    function hoverMouseOn() {
        var mouse_x = d3.mouse(this)[0];
        var mouse_y = d3.mouse(this)[1];
        var graph_y = y.invert(mouse_y);
        var graph_x = x.invert(mouse_x);

        var mouseDate = x.invert(mouse_x);
        var i = bisectDate(newData, mouseDate);

        var d0 = newData[i - 1];
        var d1 = newData[i];

        var d = mouseDate - d0[0] > d1[0] - mouseDate ? d1 : d0;

        var formatDate = d3.timeFormat("%b %d");

        hoverText.text(formatDate(d.date))
            .attr('x', mouse_x + 10)
            .attr('y', mouse_y)
            .attr("font-weight", "bold");

        hoverText2.text("High: " + d.average_max_temp)
            .attr('x', mouse_x + 10)
            .attr('y', mouse_y);

        hoverText3.text("Low: " + d.average_min_temp)
            .attr('x', mouse_x + 10)
            .attr('y', mouse_y);

        hoverText4.text("Record High: " + d.record_max_temp + ", " + d.record_max_temp_year)
            .attr('x', mouse_x + 10)
            .attr('y', mouse_y);

        hoverText5.text("Record Low: " + d.record_min_temp + ", " + d.record_min_temp_year)
            .attr('x', mouse_x + 10)
            .attr('y', mouse_y);


        hoverLine.attr("x1", mouse_x).attr("x2", mouse_x)
        hoverLineGroup.style("opacity", 1);

    }

    function hoverMouseOff() {
        hoverLineGroup.style("opacity", 0);
    }

    ///////////////////////////// 


    ///////////////////////////// selection dropdown and chart update
    var newData = data[0];
    var monthSelection = "all";
    var citycolor = houstonColor;

    // function to update chart
    function updateData(category) {
        if (category == "houston") {
            newData = data[0]
            citycolor = houstonColor;
        } else if (category == "nyc") {
            newData = data[1]
            citycolor = nycColor;
        } else {
            newData = data[2]
            citycolor = seattleColor;
        }
        updateChartMonth(monthSelection);
    }

    function updateChartMonth(month) {
        monthSelection = month;
        var monthData = newData;
        svg.selectAll(".x-axis").remove();

        if (month == "all") {
            x = d3.scaleTime()
                .domain(d3.extent(data[0], function (d) { return d.date; }))
                .range([0, width]);
            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b")));
            xAxisLabel.text("Month");
        } else {
            monthData = newData.filter(function (value, index) {
                return (value.date.getMonth() == monthSelection);
            });
            x = d3.scaleTime()
                .domain([monthData[0].date, monthData[monthData.length - 1].date])
                .range([0, width]);

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d")));

            xAxisLabel.text("Day of the Month").attr("x", width / 2 - 70)
                ;
        }

        highLowRange
            .datum(monthData)
            .transition()
            .duration(1500)
            .attr("stroke", "none")
            .attr("fill", citycolor)
            .attr("d", d3.area()
                .x(function (d) { return x(d.date) })
                .y0(function (d) { return y(d.average_max_temp) })
                .y1(function (d) { return y(d.average_min_temp) })
            );

        recordHighLine
            .datum(monthData)
            .transition()
            .duration(1500)
            .attr("stroke", citycolor)
            .attr("d", d3.line()
                .x(function (d) { return x(d.date); })
                .y(function (d) { return y(d.record_max_temp); })
            );

        recordLowLine
            .datum(monthData)
            .transition()
            .duration(1500)
            .attr("stroke", citycolor)
            .attr("d", d3.line()
                .x(function (d) { return x(d.date); })
                .y(function (d) { return y(d.record_min_temp); })
            );

        // side panel
        var warmestMonth = "june";
        var coldestMonth = "december";
        var averageRainfall = "0.1"
        if (monthSelection == "all") {
            stat1.text("the warmest month is " + warmestMonth);
            stat2.text("the coldest month is " + coldestMonth);
            stat3.text("the average rainfall is " + averageRainfall);
        }

    }


    // detect change from the dropdown, then call update functions
    d3.select("#selectButton").on("change", function (d) {
        var select = d3.select('#categorySelect').node();
        // Get current value of select element
        var category = d3.select(this).property("value");
        // Update chart with the selected category of letters
        updateData(category);
    });


    d3.select("#selectButtonMonth").on("change", function (d) {

        var select = d3.select('#monthSelect').node();
        // Get current value of select element
        var month = d3.select(this).property("value");
        // Update chart with the selected category of letters
        updateChartMonth(month);
    });






})





