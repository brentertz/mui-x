import type { PickerValueManager } from '../hooks/usePicker';
import {
  DateValidationError,
  TimeValidationError,
  DateTimeValidationError,
  FieldSection,
} from '../../models';
import type { FieldValueManager } from '../hooks/useField';
import { areDatesEqual, getTodayDate, replaceInvalidDateByNull } from './date-utils';
import { getDefaultReferenceDate } from './getDefaultReferenceDate';
import {
  addPositionPropertiesToSections,
  createDateStrForInputFromSections,
} from '../hooks/useField/useField.utils';

export type SingleItemPickerValueManager<
  TValue = any,
  TDate = any,
  TError extends DateValidationError | TimeValidationError | DateTimeValidationError = any,
> = PickerValueManager<TValue, TDate, TError>;

export const singleItemValueManager: SingleItemPickerValueManager = {
  emptyValue: null,
  getTodayValue: getTodayDate,
  getInitialReferenceValue: ({ value, referenceDate, ...params }) => {
    if (value != null && params.utils.isValid(value)) {
      return value;
    }

    if (referenceDate != null) {
      return referenceDate;
    }

    return getDefaultReferenceDate(params);
  },
  cleanValue: replaceInvalidDateByNull,
  areValuesEqual: areDatesEqual,
  isSameError: (a, b) => a === b,
  hasError: (error) => error != null,
  defaultErrorState: null,
  getTimezone: (utils, value) => (value == null ? null : utils.getTimezone(value)),
  setTimezone: (utils, timezone, value) =>
    value == null ? null : utils.setTimezone(value, timezone),
};

export const singleItemFieldValueManager: FieldValueManager<any, any, FieldSection> = {
  updateReferenceValue: (utils, value, prevReferenceValue) =>
    value == null || !utils.isValid(value) ? prevReferenceValue : value,
  getSectionsFromValue: (utils, date, prevSections, isRTL, getSectionsFromDate) => {
    const shouldReUsePrevDateSections = !utils.isValid(date) && !!prevSections;

    if (shouldReUsePrevDateSections) {
      return prevSections;
    }

    return addPositionPropertiesToSections(getSectionsFromDate(date), isRTL);
  },
  getValueStrFromSections: createDateStrForInputFromSections,
  getActiveDateManager: (utils, state) => ({
    date: state.value,
    referenceDate: state.referenceValue,
    getSections: (sections) => sections,
    getNewValuesFromNewActiveDate: (newActiveDate) => ({
      value: newActiveDate,
      referenceValue:
        newActiveDate == null || !utils.isValid(newActiveDate)
          ? state.referenceValue
          : newActiveDate,
    }),
  }),
  parseValueStr: (valueStr, referenceValue, parseDate) =>
    parseDate(valueStr.trim(), referenceValue),
};
