import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { ItemService } from '../services/item';
import { Item } from '../models/item.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatIconModule, MatButtonModule, MatTableModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

  items: Item[] = [];
  lowStockItems: Item[] = [];
  isLoading = true;

  // Stat cards
  totalItems = 0;
  totalValue = 0;
  lowStockCount = 0;
  totalProfit = 0;

  // Bar chart — top 8 items by quantity
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false },
      title: { display: true, text: 'Stock Levels by Item' } },
    scales: { y: { beginAtZero: true } }
  };

  // Doughnut chart — items by category
  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' },
      title: { display: true, text: 'Items by Category' } }
  };

  lowStockColumns = ['name', 'location', 'quantity'];

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.calcStats(items);
        this.buildBarChart(items);
        this.buildDoughnutChart(items);
        this.isLoading = false;
      }
    });

    this.itemService.getLowStock(5).subscribe(items => {
      this.lowStockItems = items;
    });
  }

  calcStats(items: Item[]): void {
    this.totalItems = items.length;
    this.totalValue = items.reduce((sum, i) => sum + i.buyingPrice * i.quantity, 0);
    this.lowStockCount = items.filter(i => i.quantity <= 5).length;
    this.totalProfit = items.reduce((sum, i) =>
      sum + (i.sellingPrice - i.buyingPrice) * i.quantity, 0);
  }

  buildBarChart(items: Item[]): void {
    const top8 = [...items]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    this.barChartData = {
      labels: top8.map(i => i.name.length > 14 ? i.name.slice(0, 14) + '…' : i.name),
      datasets: [{
        data: top8.map(i => i.quantity),
        backgroundColor: top8.map(i =>
          i.quantity <= 5 ? '#ef9a9a' : '#90caf9'),
        borderColor: top8.map(i =>
          i.quantity <= 5 ? '#e53935' : '#1565c0'),
        borderWidth: 1,
        borderRadius: 6
      }]
    };
  }

  buildDoughnutChart(items: Item[]): void {
    const catMap = new Map<string, number>();
    items.forEach(i => {
      const key = i.categoryName || 'Uncategorised';
      catMap.set(key, (catMap.get(key) || 0) + 1);
    });

    const colors = ['#42a5f5','#66bb6a','#ffa726','#ef5350',
                    '#ab47bc','#26c6da','#d4e157','#ff7043'];

    this.doughnutData = {
      labels: [...catMap.keys()],
      datasets: [{
        data: [...catMap.values()],
        backgroundColor: colors.slice(0, catMap.size),
        hoverOffset: 8
      }]
    };
  }
}