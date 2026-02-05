import { FormControl } from "@angular/forms";

export class Card {
  inputControl = new FormControl<number | null>(null);

  constructor(
    public key: string,
    public name: string,
    public spending: number,
    public limit: number,
    public imageUrl: string
  ) { }
}
