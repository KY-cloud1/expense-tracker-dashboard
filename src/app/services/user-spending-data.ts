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

  getUserSpendingSummary(): Observable<UserSpending> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(data => {
        // Use interface to ensure no unknown objects.
        interface CardData {
          name: string;
          spending: number;
          limit: number;
          imageUrl: string;
        }

        let totalCardSpendYtd = 0;

        // Convert the 'cards' objects into an array of Card instances safely.
        const cardsArray: Card[] = Object.entries(data.cards)
          .filter((entry): entry is [string, CardData] => {
            const [key, card_data] = entry;
            return (
              typeof card_data === 'object' &&
              card_data !== null &&
              'name' in card_data &&
              'spending' in card_data
            );
          })
          .map(([key, card_data]) => {
            totalCardSpendYtd += card_data.spending;

            return new Card(
              key,
              card_data.name,
              card_data.spending,
              card_data.limit,
              card_data.imageUrl
            );
          });

        // Convert cardsArray to dictionary.
        const cardsDict: Record<string, Card> = {};
        cardsArray.forEach(card => {
          cardsDict[card.key] = card;
        });

        const miscSpend = data.misc_spending
        const totalSpendYtd = totalCardSpendYtd + miscSpend

        // Calculate monthly spend based on the current month.
        const currDate = new Date();
        const currMonthIndex = currDate.getMonth();
        const monthlySpend = totalSpendYtd / (currMonthIndex + 1)

        return new UserSpending(
          totalSpendYtd,
          monthlySpend,
          miscSpend,
          cardsDict
        );
      })
    );
  }

  updateMiscSpending(newMiscSpending: number): Observable<UserSpending> {
    return this.http.patch<UserSpending>(this.baseUrl, {
      misc_spending: newMiscSpending,
    });
  }

  updateCardSpending(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<UserSpending>(
      this.baseUrl, {
      cards,
    });
  }

  updateCardLimit(cards: Record<string, Card>): Observable<UserSpending> {
    return this.http.patch<UserSpending>(
      this.baseUrl, {
      cards,
    });
  }
}
