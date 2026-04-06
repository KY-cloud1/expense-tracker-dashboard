import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UserSpending } from '../models/user-spending';
import { Card } from '../models/card';

/**
 * Service responsible for fetching and updating user spending data.
 * Communicates with a local JSON server (json-server) via HTTP.
 * All methods return Observables of UserSpending, mapped from the raw API response.
 */
@Injectable({
  providedIn: 'root',
})
export class UserSpendingDataService {

  private baseUrl = 'http://localhost:3000/userSpending';

  constructor(private http: HttpClient) { }

  /**
   * Maps a raw API response object to a UserSpending instance.
   * Computes the average monthly spend based on the current month of the year.
   */
  private mapToUserSpending(data: any): UserSpending {
    const cardsDict: Record<string, Card> = {};
    Object.entries(data.cards).forEach(([key, card_data]: [string, any]) => {
      // Only map entries that have the minimum required card fields.
      if (card_data && 'name' in card_data && 'spending' in card_data) {
        cardsDict[key] = new Card(key, card_data.name, card_data.spending, card_data.limit, card_data.imageUrl);
      }
    });

    const miscSpendYtd = data.misc_spending_ytd ?? 0;
    const totalSpendYtd = data.total_spending_ytd ?? 0;
    const avgMonthlySpend = totalSpendYtd / (new Date().getMonth() + 1);

    return new UserSpending(totalSpendYtd, avgMonthlySpend, miscSpendYtd, cardsDict);
  }

  /**
   * Strips any class-specific properties from Card instances before sending
   * to the API, ensuring only plain data fields are persisted to db.json.
   */
  private sanitizeCards(cards: Record<string, Card>): Record<string, object> {
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

  /** Fetches the full user spending summary from the API. */
  getUserSpendingSummary(): Observable<UserSpending> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(data => this.mapToUserSpending(data))
    );
  }

  /** Updates the miscellaneous spending and total YTD values. */
  updateMiscSpending(newMiscSpending: number, newTotalYtd: number): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      misc_spending_ytd: newMiscSpending,
      total_spending_ytd: newTotalYtd
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  /** Updates the spending value for one or more cards and the total YTD. */
  updateCardSpending(cards: Record<string, Card>, newTotalYtd: number): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards),
      total_spending_ytd: newTotalYtd
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  /** Updates the spending limit for one or more cards. */
  updateCardLimit(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards)
    }).pipe(map(data => this.mapToUserSpending(data)));
  }

  /** Resets the spending value to 0 for one or more cards, simulating a payment. */
  payCard(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<any>(this.baseUrl, {
      cards: this.sanitizeCards(cards)
    }).pipe(map(data => this.mapToUserSpending(data)));
  }
}