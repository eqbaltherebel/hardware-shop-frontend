import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, Chart, registerables } from 'chart.js';
import { ItemService} from '../../services/item';
import {  PriceHistory } from '../../models/item.model';

Chart.register(...registerables);

@Component({
  selector: 'app-price-history',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatIconModule, MatButtonModule,
    MatTableModule, BaseChartDirective
  ],
  templateUrl: './price-history.html',
  styleUrls: ['./price-history.scss']
})
export class PriceHistoryComponent implements OnInit {

  itemId!: number;
  history: PriceHistory[] = [];
  isLoading = true;
  displayedColumns = ['changedAt', 'buyingPrice', 'sellingPrice', 'profit', 'changedBy'];

  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Price History Over Time' }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: (v) => '₹' + v }
      }
    }
  };

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.itemId = +this.route.snapshot.paramMap.get('id')!;
    this.loadHistory();
  }

  loadHistory(): void {
    this.itemService.getPriceHistory(this.itemId).subscribe({
      next: (data) => {
        this.history = data;
        this.buildChart(data);
        this.isLoading = false;
      }
    });
  }

  buildChart(data: PriceHistory[]): void {
    const reversed = [...data].reverse(); // oldest first for chart
    this.lineChartData = {
      labels: reversed.map(h =>
        new Date(h.changedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      ),
      datasets: [
        {
          label: 'Buying Price (₹)',
          data: reversed.map(h => h.buyingPrice),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Selling Price (₹)',
          data: reversed.map(h => h.sellingPrice),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  }

  getProfit(h: PriceHistory): number {
    return h.sellingPrice - h.buyingPrice;
  }
}