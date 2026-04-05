import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserSpending } from '../models/user-spending';
import { Card } from '../models/card';

@Injectable({
  providedIn: 'root',
})
export class UserSpendingDataService {

  private baseUrl = 'http://localhost:3000/userSpending';

  constructor(private http: HttpClient) { }

  private mapToUserSpending(data: any): UserSpending {
    const cardsDict: Record<string, Card> = {};
    Object.entries(data.cards).forEach(([key, card_data]: [string, any]) => {
      if (card_data && 'name' in card_data && 'spending' in card_data) {
        cardsDict[key] = new Card(key, card_data.name, card_data.spending, card_data.limit, card_data.imageUrl);
      }
    });

    const miscSpendYtd = data.misc_spending_ytd ?? 0;
    const totalSpendYtd = data.total_spending_ytd ?? 0;
    const avgMonthlySpend = totalSpendYtd / (new Date().getMonth() + 1);

    return new UserSpending(totalSpendYtd, avgMonthlySpend, miscSpendYtd, cardsDict);
  }

  private sanitizeCards(cards: Record<string, Card>): Record<string, object> {
    // Remove Angular FormControl internals and other class properties
    // from being inserted into db.json.
    const sanitized: Record<string, object> = {};
    Object.entries(cards).forEach(([key, card]) => {
      sanitized[key] = {
        key: card.key,
        name: card.name,
        spending: card.spending,
        limit: card.limit,
        imageUrl: card.imageUrl
      };
    });
    return sanitized;
  }

  getUserSpendingSummary(): Observable<UserSpending> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(data => this.mapToUserSpending(data))
    );
  }

  updateMiscSpending(newMiscSpending: number): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      misc_spending_ytd: newMiscSpending,
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  updateCardSpending(cards: Record<string, Card>, newTotalYtd: number): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards),
      total_spending_ytd: newTotalYtd
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  updateCardLimit(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards)
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  payCard(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards)
    }).pipe(map(data => this.mapToUserSpending(data)));
  }
}