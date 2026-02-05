import { Card } from './card';

export class UserSpending {
    constructor(
        public spending_ytd: number,
        public spending_month: number,
        public misc_spend: number,
        public cards: Record<string, Card>
    ) { }
}
