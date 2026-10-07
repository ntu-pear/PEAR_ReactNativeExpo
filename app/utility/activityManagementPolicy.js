// Catalogue and centre changes require safe request reconciliation. Availability
// and ad hoc changes also lack complete service validation contracts. All new
// management mutations remain disabled; existing records can be read.
export const activityMutationBlockReason = (kind) => {
  if (['activity', 'centre'].includes(kind)) {
    return 'Activity changes are unavailable while safe request reconciliation is reviewed. Existing records are read-only.';
  }
  if (kind === 'availability') {
    return 'Availability changes are unavailable until the service provides a complete availability read and safe write reconciliation.';
  }
  if (kind === 'adhoc') {
    return 'Ad hoc changes are unavailable until the service validates the affected occurrence and replacement availability.';
  }
  return '';
};
