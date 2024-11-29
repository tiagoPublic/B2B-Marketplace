// BAR CHART

document.addEventListener('DOMContentLoaded', function() {
    fetch('/top-products')
        .then(response => response.json())
        .then(data => {
            const categories = data.map(item => item.product_name);
            const salesData = data.map(item => item.sales_count);

            const barChartOptions = {
                series: [{
                    data: salesData
                }],
                chart: {
                    type: 'bar',
                    height: 350,
                    toolbar: {
                        show: false
                    },
                },
                colors: [
                    "#3BBA9C",
                    "#294D61",
                ],
                plotOptions: {
                    bar: {
                        distributed: true,
                        borderRadius: 4,
                        borderRadiusApplication: 'end',
                        horizontal: false,
                        columnWidth: '40%',
                    }
                },
                dataLabels: {
                    enabled: false
                },
                legend: {
                    show: false
                },
                xaxis: {
                    categories: categories,
                },
                yaxis: {
                    title: {
                        text: "Sales"
                    }
                }
            };

            const barChart = new ApexCharts(document.querySelector("#bar-chart-reports"), barChartOptions);
            barChart.render();
        })
        .catch(error => console.error('Error fetching top products:', error));
});

// AREA CHART

var areaChartOptions = {
    series: [{
        name: 'Purchase Orders',
        data: [31, 40, 28, 51, 42, 109, 100]
    }, {
        name: 'Sales Orders',
        data: [11, 32, 45, 32, 34, 52, 41]
    }],
    chart: {
        height: 350,
        type: 'area',
        toolbar: {
            show: false,
        },
    },
    colors: ["#294D61", "#3BBA9C"],
    dataLabels: {
        enabled: false,
    },
    stroke: {
        curve: 'smooth'
    },
    labels: ['Jan', 'Feb','Mar','Apr','May','Jun','Jul'],
    markers: {
        size: 0
    },
    yaxis: [
        {
            title: {
                text: 'Purchase Orders',
            },
        },
        {
            opposite: true,
            title: {
                text: 'Sales Orders',
            },
        },
    ],
    tooltip: {
        shared: true,
        intersect: false,
    }
};

var areaChart = new ApexCharts(document.querySelector("#area-chart-reports"), areaChartOptions);
areaChart.render();