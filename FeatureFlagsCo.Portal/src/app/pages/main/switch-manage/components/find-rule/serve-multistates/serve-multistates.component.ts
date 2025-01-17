import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IVariationOption, IRulePercentageRollout } from '../../../types/switch-new';

interface IRulePercentageRolloutValue extends IRulePercentageRollout {
  percentageValue: number;
}

@Component({
  selector: 'app-serve-multistates',
  templateUrl: './serve-multistates.component.html',
  styleUrls: ['./serve-multistates.component.less']
})
export class ServeMultistatesComponent implements OnInit {

  @Input() isSingle: boolean = false;
  @Input() variationOptions: IVariationOption[] = [];
  @Input() rulePercentageRollouts: IRulePercentageRollout[] = [];

  @Output() onPercentageChange = new EventEmitter<IRulePercentageRollout[]>();

  selectedValueOptionId: number = -1;
  rulePercentageRolloutValues: IRulePercentageRolloutValue[] = [];
  result: IRulePercentageRollout[] = [];

  constructor() { }

  ngOnInit(): void {

    if (this.isNotPercentageRollout()) {
      this.selectedValueOptionId = this.rulePercentageRollouts[0]?.valueOption.localId || this.variationOptions[0].localId;
      this.rulePercentageRolloutValues = this.variationOptions.map((v, idx) => ({
        rolloutPercentage: [0, idx === 0 ? 1 : 0],
        valueOption: Object.assign({}, v),
        percentageValue: idx === 0 ? 100 : 0
      }));
    } else {
      this.selectedValueOptionId = -1;
      this.rulePercentageRolloutValues = this.variationOptions.map(v => {
        const rule = this.rulePercentageRollouts.find(x => x.valueOption.localId === v.localId);
        const result = {
          rolloutPercentage: [0, 0],
          valueOption: Object.assign({}, v),
          percentageValue: 0
        }
        if (rule) {
            result.rolloutPercentage = [rule.rolloutPercentage[0], rule.rolloutPercentage[1]];
            result.percentageValue = this.getPercentageFromRolloutPercentageArray(result.rolloutPercentage);
        }
        return result;
      });
    }
  }

  getPercentageFromRolloutPercentageArray(arr: number[]): number {
    const diff = arr[1] - arr[0];
    return Number((Number(diff.toFixed(2)) * 100).toFixed(0));
  }

  private isNotPercentageRollout() : boolean {
    return this.rulePercentageRollouts.length === 0 || (this.rulePercentageRollouts.length === 1 && this.rulePercentageRollouts[0].rolloutPercentage.length === 2 && this.rulePercentageRollouts[0].rolloutPercentage[0] === 0 && this.rulePercentageRollouts[0].rolloutPercentage[1] === 1);
  }

  public modelChange() {
    if(this.selectedValueOptionId === -1) {
      let currentRolloutPercentage = [0, 0];
      this.result = this.rulePercentageRolloutValues.map(r => {
        currentRolloutPercentage = [currentRolloutPercentage[1], currentRolloutPercentage[1] + r.percentageValue / 100.0]
        return {
          rolloutPercentage: currentRolloutPercentage,
          valueOption: r.valueOption
        };
      });
    } else {
      this.result = [
        {
          rolloutPercentage: [0, 1],
          valueOption: this.variationOptions.find(x => x.localId === this.selectedValueOptionId)
        }
      ];
    }

    this.onOutputPercentage();
  }

  // 抛出事件
  private onOutputPercentage() {
    this.onPercentageChange.next(Array.from(this.result));
  }
}
