const url =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const width = 900,
    height = 450,
    padding = 60;
let xScale,
    yScale,
    baseTemp,
    values = [],
    minYear,
    maxYear,
    numberOfYears = maxYear - minYear;
const svg = d3.select("svg");
const tooltip = d3.select("#tooltip");

const generateScales = () => {
    minYear = d3.min(values, (item) => {
        return item.year;
    });
    maxYear = d3.max(values, (item) => {
        return item.year;
    });

    xScale = d3
        .scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - padding]);

    yScale = d3
        .scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height - padding]);
};

const generateCanvas = () => {
    svg.attr("width", width);
    svg.attr("height", height);
};

const generateCells = () => {
    svg.selectAll("rect")
        .data(values)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("fill", (item) => {
            let variance = item.variance;
            if (variance <= -1) {
                return "MediumBlue";
            } else if (variance <= 0) {
                return "DeepSkyBlue";
            } else if (variance <= 1) {
                return "Orange";
            } else {
                return "FireBrick";
            }
        })
        .attr("data-year", (item) => {
            return item.year;
        })
        .attr("data-month", (item) => {
            return item.month - 1;
        })
        .attr("data-temp", (item) => {
            return baseTemp + item.variance;
        })
        .attr("height", (item) => {
            return (height - 2 * padding) / 12;
        })
        .attr("y", (item) => {
            return yScale(new Date(0, item.month - 1, 0, 0, 0, 0, 0));
        })
        .attr("width", (item) => {
            numberOfYears = maxYear - minYear;
            return (width - 2 * padding) / numberOfYears;
        })
        .attr("x", (item) => {
            return xScale(item.year);
        })
        .on("mouseover", (item) => {
            tooltip.transition().style("visibility", "visible");
            let monthNames = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            tooltip.text(
                `${monthNames[item.month - 1]} ${item.year} | Temp: ${
                    Math.round((item.variance + baseTemp) * 1000) / 1000
                }\u{2103} | Variance: ${item.variance}\u{2103}`
            );
            tooltip.attr("data-year", item.year);
        })
        .on("mouseout", (item) => {
            tooltip.transition().style("visibility", "hidden");
        });
};

const generateAxes = () => {
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"));

    svg.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height - padding})`);

    svg.append("g")
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding}, 0)`);
};

fetch(url)
    .then((res) => res.json())
    .then((res) => {
        const data = res;
        baseTemp = data.baseTemperature;
        values = data.monthlyVariance;
        generateCanvas();
        generateScales();
        generateCells();
        generateAxes();
    });
