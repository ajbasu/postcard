document.addEventListener("DOMContentLoaded", function () {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTx8MVqTEWSNRM3bgajPtxJD3pjnLmtTSS5ReTiZPVpspqhIRnmJeHqejr_xYaP5FcP1I4jGFGPqrEH/pub?gid=1393900579&single=true&output=csv";

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.trim().split("\n").slice(1);
            const groups = {};

            rows.forEach(row => {
                const cols = row.split(",");
                // Column 2: Country code (index 1)
                const countryCode = cols[1] ? cols[1].trim() : "";
                if (countryCode === "-" || countryCode === "") return;

                // Column 4: Received status (index 3)
                let status = cols[3] ? cols[3].trim() : "";
                if (status === "No") return;

                // If status is "Yes", override to "Received"
                const groupKey = (status === "Yes") ? "Received" : status;

                // Column 6: Received date (index 5)
                const receivedOn = cols[5] ? cols[5].trim() : "Unknown";

                const entry = {
                    id: countryCode,
                    receivedon: receivedOn
                };

                if (!groups[groupKey]) {
                    groups[groupKey] = [];
                }
                groups[groupKey].push(entry);
            });

            // Convert the groups object into an array suitable for the map
            const groupData = [];
            for (let key in groups) {
                groupData.push({
                    name: key,
                    data: groups[key]
                });
            }

            initMap(groupData);
        })
        .catch(error => console.error("Failed to fetch or parse CSV:", error));

    // Initialize the map using amCharts 5
    function initMap(groupData) {
        am5.ready(function () {
            var root = am5.Root.new("fotw-chartdiv");
            root.setThemes([am5themes_Animated.new(root)]);

            var chart = root.container.children.push(am5map.MapChart.new(root, {}));
            var worldSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_worldHigh,
                exclude: ["AQ"]
            }));

            worldSeries.mapPolygons.template.setAll({
                fill: am5.color(0xaaaaaa),
                tooltipText: "{name}"
            });

            worldSeries.events.on("datavalidated", () => {
                chart.goHome();
            });

            var legend = chart.children.push(am5.Legend.new(root, {
                useDefaultMarker: true,
                centerX: am5.p50,
                x: am5.p50,
                centerY: am5.p100,
                y: am5.p100,
                dy: -20,
                background: am5.RoundedRectangle.new(root, {
                    fill: am5.color(0xffffff),
                    fillOpacity: 0.2
                })
            }));

            legend.valueLabels.template.set("forceHidden", true);
            var colors = am5.ColorSet.new(root, { step: 2 });
            colors.next();

            am5.array.each(groupData, function (group) {
                var countries = [];
                var color = colors.next();
                // var color;
                // if (group.name === "Received") {
                //     color = am5.color(0xd3edbb); // Received: #d3edbb
                // } else if (group.name === "Arranged") {
                //     color = am5.color(0xffe6a1); // Arranged: #ffe6a1
                // } else {
                //     color = am5.color(0xe8eaed); // Default group color (if any group exists) - though only "Received" and "Arranged" should appear.
                // }

                am5.array.each(group.data, function (country) {
                    countries.push(country.id);
                });

                var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
                    geoJSON: am5geodata_worldHigh,
                    include: countries,
                    name: group.name,
                    fill: color
                }));

                polygonSeries.data.setAll(group.data);
                legend.data.push(polygonSeries);
            });
        });
    }
});
