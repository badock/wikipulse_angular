import {Component, OnInit} from '@angular/core';
import {WikipediaService} from './wikipedia.service';
import * as d3 from 'd3';
import * as moment from 'moment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'wiki-pulse-angular';
  inputText = '';

  articleName = '';
  viewLastMonth = '';
  rankingByViews = '';
  summary = '';
  wikipediaUrl = '';

  svg;
  height = 400;
  width = 400;
  margin = 10;
  statisticsData = {};

  constructor(private wikipediaService: WikipediaService) {
  }

  ngOnInit(): void {
    this.createSvg();
  }

  private createSvg(): void {
    this.svg = d3.select('figure#bar')
      .append('svg')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .append('g')
      .attr('id', 'graph_svg')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  }

  inputTextChange(): void {
    this.wikipediaService.findMatchingArticles(this.inputText).subscribe(value => {
      const firstMatch: string = value[1][0];

      if (firstMatch === '' || firstMatch === undefined) {
        return;
      }

      this.wikipediaService.getSummary(firstMatch).subscribe(summaryValue => {
        console.log(summaryValue);
        this.articleName = summaryValue.title;
        this.summary = summaryValue.extract;
        this.wikipediaUrl = summaryValue.content_urls.desktop.page;
      });

      this.wikipediaService.getStatisticsKeywords(firstMatch).subscribe(statisticsValue => {
        this.statisticsData = statisticsValue;
        this.refreshHeatMap();
      });
    });
  }

  refreshHeatMap(): void {
    // console.log(this.statisticsData);
    const graphSvg = d3.select('g#graph_svg');
    graphSvg.selectAll('*').remove();

    // const minViews = Math.min(...this.statisticsData['items'].map((item) => item.views));
    // const maxViews = Math.max(...this.statisticsData['items'].map((item) => item.views));
    // const legendMin = minViews;
    // const legendMax = maxViews;

    const sortedViews = this.statisticsData['items'].map((item) => item.views).sort((a,b) => a-b);
    const legendMin = sortedViews[Math.round(0.05 * sortedViews.length)];
    const legendMax = sortedViews[Math.round(0.95 * sortedViews.length)];

    const weekAngle = 2 * Math.PI / 52;
    const yearCount = (2020 - 2016) + 1;
    const yearRadius = (this.height - 40) / (2 * yearCount + 1) / 1.1;

    let maxRatioView = 0.0;

    // const colorPicker = d3.scaleLinear()
    //   .domain([0, 0.5, 1])
    //   .range(["yellow", "orange", "red"]);

    // const colorPicker = d3.scaleLinear()
    //   .domain([-1, 0, 1])
    //   .range(["orange", "white", "green"]);
    const colorPicker = d3.interpolateHslLong("#DDDDDD", "red");

    this.statisticsData['items'].map((item) => {
      const date = moment(item.timestamp, 'YYYYMMDDHH');

      const minAngle = date.week() * weekAngle - Math.PI / 2 - weekAngle;
      const maxAngle = minAngle + weekAngle;

      const spiralCenterX = this.width / 2;
      const spiralCenterY = this.height / 2;

      let minRadius = (date.year() - 2016) * (yearRadius * 1.1) + date.week() * (yearRadius * 1.1 / 52) + date.weekday() * yearRadius / 7;

      if (date.week() === 1 && date.month() === 11) {
        minRadius += yearRadius * 1.1;
      }

      const maxRadius = minRadius + (yearRadius - 10) / 7;

      const x1 = spiralCenterX + Math.cos(minAngle) * minRadius;
      const y1 = spiralCenterY + Math.sin(minAngle) * minRadius;
      const x2 = spiralCenterX + Math.cos(maxAngle) * minRadius;
      const y2 = spiralCenterY + Math.sin(maxAngle) * minRadius;
      const x3 = spiralCenterX + Math.cos(maxAngle) * maxRadius;
      const y3 = spiralCenterY + Math.sin(maxAngle) * maxRadius;
      const x4 = spiralCenterX + Math.cos(minAngle) * maxRadius;
      const y4 = spiralCenterY + Math.sin(minAngle) * maxRadius;

      let ratioViews = (item.views - legendMin) / (legendMax - legendMin);
      if (ratioViews >= 1.0) {
        ratioViews = 1.0;
      }


      // const itemColor = d3.interpolateRgb('blue', 'red')(ratioViews);
      const itemColor = colorPicker(ratioViews);
      // const itemColor = d3.interpolateViridis(ratioViews);

      if (maxRatioView < ratioViews) {
        maxRatioView = ratioViews;
        console.log(`new ratioView = ${maxRatioView} and ${itemColor}`);
      }

      graphSvg.append('path')
        .attr('d', (d) => `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`)
        .style('fill', itemColor)
        .style('stroke', itemColor);
    });
  }

}
