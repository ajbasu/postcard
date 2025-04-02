document.addEventListener("DOMContentLoaded", function () {
    fetch("assets/data/fotw.json")
        .then(response => response.json())
        .then(groupData => {
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
        })
        .catch(error => console.error("Error loading JSON:", error));
});
