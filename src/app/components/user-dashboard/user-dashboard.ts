import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSpendingDataService } from '../../services/user-spending-data';
import { UserSpending } from '../../models/user-spending';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboardComponent implements OnInit{

  userSpending ?: UserSpending;

  constructor(
    private userSpendingDataService: UserSpendingDataService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userSpendingDataService.getUserSpending().subscribe({
      next: data => {
        this.userSpending = data,
        this.cdr.detectChanges()  // Force template to update.
      },
      error: err => console.error('Error in user-dashboard component:', err)
    });
  }
}
