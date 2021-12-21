'use strict'

export const removeNonAlphaNumeric = str => str.replace(/[^a-zA-Z0-9]/g, '')
export const stringSort = (a, b) => a.localeCompare(b)