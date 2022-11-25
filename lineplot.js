// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 90, left: 40 },
    width = 560 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// Parse the Data
d3.csv("KHOU.csv",
    // When reading the csv, I must format variables:
    function (d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.date), actual_mean_temp: d.actual_mean_temp }
    },


    function (data) {
        // aggregation test
        var monthlyAvgTemp = d3.nest()
            .key(function (d) { return d.date.getMonth(); })
            .rollup(function (v) {
                return d3.mean(v, function (d) { return d.actual_mean_temp; });
            })
            .entries(data);

        console.log(JSON.stringify(monthlyAvgTemp));


        // x axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function (d) { console.log(d.date.getMonth()); return d.date.getMonth(); }))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(12));

        // y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d.actual_mean_temp; })])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // add the line

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "hotpink")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d, i) { //console.log(monthlyAvgTemp[i].key); 
                    return x(d.date)
                })
                .y(function (d, i) { //console.log(monthlyAvgTemp[i].value); 
                    return y(d.actual_mean_temp)
                })
            )

    }
);

/*
Promise.all([
    d3.csv("KHOU.csv",
        function (d) {
            console.log(d.date);
            return { date: d3.timeParse("%Y-%m-%d")(d.date), actual_mean_temp: d.actual_mean_temp }
        }),
    d3.csv("KNYC.csv",
        function (d) {
            console.log(d.date);
            return { date: d3.timeParse("%Y-%m-%d")(d.date), actual_mean_temp: d.actual_mean_temp }
        }),
    d3.csv("KSEA.csv",
        function (d) {
            console.log(d.date);
            return { date: d3.timeParse("%Y-%m-%d")(d.date), actual_mean_temp: d.actual_mean_temp }
        })
]).then(function (data) {
    // x axis
    var x = d3.scaleTime()
        .domain(d3.extent(data[1], function (d) { return d.date; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data[1], function (d) { return +d.actual_mean_temp; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // add the line

    svg.append("path")
        .datum(data[1])
        .attr("fill", "none")
        .attr("stroke", "hotpink")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.date) })
            .y(function (d) { return y(d.actual_mean_temp) })
        )


})
*/

