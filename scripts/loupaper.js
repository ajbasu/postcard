am5.ready(function () {

    // Load JSON Data
    fetch("assets/data/loupaper.json")
        .then(response => response.json())
        .then(groupData => {

            // Create Root
            var root = am5.Root.new("lou-chartdiv");

            // Set Theme
            root.setThemes([
                am5themes_Animated.new(root)
            ]);

            // Create Map
            var chart = root.container.children.push(am5map.MapChart.new(root, {
                panX: "rotateX",
                panY: "none",
                projection: am5map.geoAlbersUsa(),
                layout: root.horizontalLayout
            }));

            // Create Map Polygon Series
            var worldSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
                geoJSON: am5geodata_usaLow,
                valueField: "value",
                calculateAggregates: true
            }));

            worldSeries.mapPolygons.template.setAll({
                fill: am5.color(0xaaaaaa),
                tooltipText: "{name}"
            });

            worldSeries.events.on("datavalidated", () => {
                chart.goHome();
            });

            // Create Legend
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

            // Create Series for Each Group
            var colors = am5.ColorSet.new(root, { step: 2 });
            colors.next();

            am5.array.each(groupData, function (group) {
                var countries = [];
                var color = group.name == 'Yet to Release' ? am5.color(0xd3d3d9) : colors.next();

                am5.array.each(group.data, function (country) {
                    countries.push(country.id);
                });

                var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
                    geoJSON: am5geodata_usaLow,
                    include: countries,
                    name: group.name,
                    fill: color,
                }));

                polygonSeries.data.setAll(group.data);
                legend.data.push(polygonSeries);
            });
        });

});
