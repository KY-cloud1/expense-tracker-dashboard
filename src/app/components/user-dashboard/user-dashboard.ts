import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UserSpending } from '../../models/user-spending';
import { Card } from '../../models/card'
import { UserSpendingDataService } from '../../services/user-spending-data';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgOptimizedImage, ReactiveFormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboardComponent implements OnInit {

  userSpending?: UserSpending;
  today: Date = new Date();

  miscValueControl = new FormControl(null)
  cardControls: Record<string, { spending: FormControl; limit: FormControl }> = {};

  constructor(
    private userSpendingDataService: UserSpendingDataService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userSpendingDataService.getUserSpendingSummary().subscribe({
      next: data => {
        Object.entries(data.cards).forEach(([key, card]) => {
          this.cardControls[key] = {
            spending: new FormControl(null),
            limit: new FormControl(null)
          };
        });

        this.userSpending = data;
        this.cdr.detectChanges();  // Force template to update.
      },
      error: err => console.error('Error user-dashboard component init:', err)
    });
  }

  handleMiscSpendCancel(): void {
    this.miscValueControl.reset();
    return;
  }

  handleMiscSpendSubmit(): void {
    if (!this.userSpending) return;

    const miscUpdateDelta = Number(this.miscValueControl.value);
    if (isNaN(miscUpdateDelta)) {
      this.miscValueControl.reset();
      return;
    }

    const updatedMiscSpending =
      this.userSpending.misc_spend + miscUpdateDelta;

    this.userSpendingDataService.updateMiscSpending(updatedMiscSpending)
      .subscribe({
        next: updatedValue => {
          this.userSpending = updatedValue;
          this.miscValueControl.reset();
        },
        error: err => {
          console.error('handleMiscSubmit failed', err);
        }
      })
  }

  get miscSpendingDisplay(): number {
    if (!this.userSpending) return 0;

    const miscDelta = Number(this.miscValueControl.value ?? 0);
    return this.userSpending.misc_spend + miscDelta;
  }

  get cardList(): Card[] {
    return Object.values(this.userSpending?.cards ?? {});
  }

  handleCardCancel(card: Card): void {
    this.cardControls[card.key].spending.reset();
    this.cardControls[card.key].limit.reset();
    return;
  }

  handleCardSpendSubmit(card: Card): void {
    if (!this.userSpending) return;

    const spendDelta = Number(this.cardControls[card.key].spending.value);
    if (isNaN(spendDelta)) {
      this.cardControls[card.key].spending.reset();
      return;
    }

    const updatedCards: Record<string, Card> = {
      ...this.userSpending.cards,
      [card.key]: {
        ...this.userSpending.cards[card.key],
        spending: this.userSpending.cards[card.key].spending + spendDelta
      }
    };

    this.userSpendingDataService
      .updateCardSpending(updatedCards)
      .subscribe({
        next: updatedValue => {
          this.userSpending = updatedValue;
          this.cardControls[card.key].spending.reset();
        },
        error: err => console.error(err)
      });
  }

  cardSpendingDisplay(card: Card): number {
    if (!this.userSpending) return 0;

    const cardSpendDelta = Number(this.cardControls[card.key]?.spending.value ?? 0);
    return card.spending + cardSpendDelta;
  }

  handleCardLimitSubmit(card: Card): void {
    if (!this.userSpending) return;

    const limitDelta = Number(this.cardControls[card.key].limit.value);
    if (isNaN(limitDelta)) {
      this.cardControls[card.key].limit.reset();
      return;
    }

    const updatedCards: Record<string, Card> = {
      ...this.userSpending.cards,
      [card.key]: {
        ...this.userSpending.cards[card.key],
        limit: this.userSpending.cards[card.key].limit + limitDelta
      }
    };

    this.userSpendingDataService
      .updateCardLimit(updatedCards)
      .subscribe({
        next: updatedValue => {
          this.userSpending = updatedValue;
          this.cardControls[card.key].limit.reset();
        },
        error: err => console.error(err)
      });
  }

  cardLimitDisplay(card: Card): number {
    if (!this.userSpending) return 0;

    const cardLimitDelta = Number(this.cardControls[card.key]?.limit.value ?? 0);
    return card.limit + cardLimitDelta;
  }

  handleCardPaid(card: Card): void {
    if (!this.userSpending) return;

    const updatedCards: Record<string, Card> = {
      ...this.userSpending.cards,
      [card.key]: {
        ...this.userSpending.cards[card.key],
        spending: 0
      }
    };

    this.userSpendingDataService
      .updateCardSpending(updatedCards)
      .subscribe({
        next: updatedValue => {
          this.userSpending = updatedValue;
          this.cardControls[card.key].spending.reset();
        },
        error: err => console.error(err)
      });
  }
}
