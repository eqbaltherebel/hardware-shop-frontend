import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import { SaleService } from '../../services/sale';
import { ReportResponse } from '../../models/sale.model';

Chart.register(...registerables);

@Component({
  selector: 'app-sale-report',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, BaseChartDirective
  ],
  templateUrl: './sale-report.html',
  styleUrls: ['./sale-report.scss']
})
export class SaleReport implements OnInit {

  report: ReportResponse | null = null;
  isLoading = false;

  fromDate: Date = new Date();
  toDate:   Date = new Date();

  // Revenue vs Profit bar chart
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Daily Revenue vs Profit' }
    },
    scales: {
      y: { beginAtZero: true,
           ticks: { callback: v => '₹' + v } }
    }
  };

  // Payment doughnut
  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Revenue by Payment Method' }
    }
  };

  topItemColumns = ['rank', 'item', 'qty', 'revenue', 'profit'];

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loadToday();
  }

  loadToday(): void {
    this.isLoading = false;
    this.saleService.getTodayReport().subscribe({
      next: (r) => { this.report = r; this.buildCharts(r);
                     this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  loadCustom(): void {
    const from = this.formatDate(this.fromDate);
    const to   = this.formatDate(this.toDate);
    this.isLoading = false;
    this.saleService.getReport(from, to).subscribe({
      next: (r) => { this.report = r; this.buildCharts(r);
                     this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  buildCharts(r: ReportResponse): void {
    // Bar chart
    const days = Object.keys(r.revenueByDay);
    this.barChartData = {
      labels: days,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: days.map(d => r.revenueByDay[d] || 0),
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderColor: '#1d4ed8',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Profit (₹)',
          data: days.map(d => r.profitByDay[d] || 0),
          backgroundColor: 'rgba(34,197,94,0.7)',
          borderColor: '#15803d',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    };

    // Doughnut chart
    const methods  = Object.keys(r.revenueByPayment);
    const colors   = ['#3b82f6', '#22c55e', '#f59e0b'];
    this.doughnutData = {
      labels: methods,
      datasets: [{
        data:            methods.map(m => r.revenueByPayment[m]),
        backgroundColor: colors.slice(0, methods.length),
        hoverOffset:     8
      }]
    };
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  get isProfitable(): boolean {
    return (this.report?.totalProfit ?? 0) >= 0;
  }
}