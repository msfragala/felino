import { CheckResult } from '../api';

export function reportError(result: CheckResult) {
  console.log(result.errorCount);
}
