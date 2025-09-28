import { useDataService } from "./../DataContext";

import React, { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend, PieController } from "chart.js";
import * as d3 from "d3";

Chart.register(PieController, ArcElement, Tooltip, Legend);

function HomePage() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const d3ContainerRef = useRef(null);

  const dataSource = {
    datasets: [
      {
        data: [],
        backgroundColor: ["#ffcd56", "#ff6384", "#36a2eb", "#fd6b19"],
      },
    ],
    labels: [],
  };

  const { loadBudget } = useDataService();

  useEffect(() => {
    loadBudget()
      .then((myBudget) => {
        dataSource.datasets[0].data = myBudget.map((item) => item.budget);
        dataSource.labels = myBudget.map((item) => item.title);

        if (chartRef.current) {  
          createChart();
        }
        createD3Chart(myBudget);
      })
      .catch((err) => console.error("Error fetching budget data", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createChart = () => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: dataSource,
    });
  };

  const createD3Chart = (myBudget) => {
    if (!d3ContainerRef.current) return;
    const width = 960;
    const height = 450;
    const radius = Math.min(width, height) / 2;
    
    d3.select(d3ContainerRef.current).selectAll("*").remove();

    const svg = d3
      .select(d3ContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    svg.append("g").attr("class", "slices");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "lines");

    const color = d3
      .scaleOrdinal()
      .domain(myBudget.map((d) => d.title))
      .range([
        "#98abc5",
        "#8a89a6",
        "#7b6888",
        "#6b486b",
        "#a05d56",
        "#d0743c",
        "#ff8c00",
      ]);

    const pie = d3.pie().sort(null).value((d) => d.value);

    const arc = d3
      .arc()
      .outerRadius(radius * 0.8)
      .innerRadius(radius * 0.4);

    const outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const key = (d) => d.data.label;

    const budgetData = () =>
      myBudget.map((item) => ({
        label: item.title,
        value: item.budget,
      }));

    const randomData = () =>
      myBudget.map((item) => ({
        label: item.title,
        value: Math.floor(Math.random() * 100),
      }));

    const midAngle = (d) => d.startAngle + (d.endAngle - d.startAngle) / 2;

    const change = (data) => {
      // PIE SLICES
      const slice = svg.select(".slices").selectAll("path.slice").data(pie(data), key);

      slice
        .enter()
        .append("path")
        .attr("class", "slice")
        .style("fill", (d) => color(d.data.label))
        .merge(slice)
        .transition()
        .duration(1000)
        .attrTween("d", function (d) {
          const self = this;
          self._current = self._current || d;
          const interpolate = d3.interpolate(self._current, d);
          self._current = interpolate(0);
          return (t) => arc(interpolate(t));
        });

      slice.exit().remove();

      // TEXT LABELS
      const text = svg.select(".labels").selectAll("text").data(pie(data), key);

      text
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .text((d) => d.data.label)
        .merge(text)
        .transition()
        .duration(1000)
        .attrTween("transform", function (d) {
          const self = this;
          self._current = self._current || d;
          const interpolate = d3.interpolate(self._current, d);
          self._current = interpolate(0);
          return (t) => {
            const d2 = interpolate(t);
            const pos = outerArc.centroid(d2);
            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
            return `translate(${pos})`;
          };
        })
        .styleTween("text-anchor", function (d) {
          const self = this;
          self._current = self._current || d;
          const interpolate = d3.interpolate(self._current, d);
          self._current = interpolate(0);
          return (t) => {
            const d2 = interpolate(t);
            return midAngle(d2) < Math.PI ? "start" : "end";
          };
        });

      text.exit().remove();

      // POLYLINES
      const polyline = svg.select(".lines").selectAll("polyline").data(pie(data), key);

      polyline
        .enter()
        .append("polyline")
        .merge(polyline)
        .transition()
        .duration(1000)
        .attrTween("points", function (d) {
          const self = this;
          self._current = self._current || d;
          const interpolate = d3.interpolate(self._current, d);
          self._current = interpolate(0);
          return (t) => {
            const d2 = interpolate(t);
            const pos = outerArc.centroid(d2);
            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
            return [arc.centroid(d2), outerArc.centroid(d2), pos]
              .map((p) => p.join(","))
              .join(" ");
          };
        });

      polyline.exit().remove();
    };

    // Initial draw
    change(budgetData());

    // Randomize button
    d3.select(".randomize").on("click", () => {
      change(randomData());
    });
  };

  return (
    <main className="center" id="main">

        <aside>
            <p><strong>Tip:</strong> Update your budget weekly for best results.</p>
        </aside>

        <p>The budget app text in French: <span lang="fr">Gestion budgétaire personnelle</span></p>

        <section className="page-area">

            <article>
                <h1>Stay on track</h1>
                <p>
                    Do you know where you are spending your money? If you really stop to track it down,
                    you would get surprised! Proper budget management depends on real data... and this
                    app will help you with that!
                </p>
            </article>
    
            <article>
                <h1>Alerts</h1>
                <p>
                    What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
                </p>
            </article>
    
            <article>
                <h1>Results</h1>
                <p>
                    People who stick to a financial plan, budgeting every expense, get out of debt faster!
                    Also, they to live happier lives... since they expend without guilt or fear... 
                    because they know it is all good and accounted for.
                </p>
            </article>
    
            <article>
                <h1>Free</h1>
                <p>
                    This app is free!!! And you are the only one holding your data!
                </p>
            </article>
    
            <article>
                <h1>Stay on track</h1>
                <p>
                    Do you know where you are spending your money? If you really stop to track it down,
                    you would get surprised! Proper budget management depends on real data... and this
                    app will help you with that!
                </p>
            </article>
    
            <article>
                <h1>Alerts</h1>
                <p>
                    What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
                </p>
            </article>
    
            <article>
                <h1>Results</h1>
                <p>
                    People who stick to a financial plan, budgeting every expense, get out of debt faster!
                    Also, they to live happier lives... since they expend without guilt or fear... 
                    because they know it is all good and accounted for.
                </p>
            </article>
    
            <article>
                <h1>Chart</h1>
                <p>
                    <canvas id="myChart" ref={chartRef} width="400" height="400" aria-label="Budget chart" role="img"></canvas>
                </p>
            </article>
            <div ref={d3ContainerRef}></div>
            <button className="randomize">Randomize</button>

        </section>

    </main>
  );
}

export default HomePage;
