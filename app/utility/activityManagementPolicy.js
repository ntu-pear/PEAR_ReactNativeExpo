// Catalogue and centre changes require safe request reconciliation. Availability
// and ad hoc changes also lack complete service validation contracts. All new
// management mutations remain disabled; existing records can be read.
export const activityMutationBlockReason = (kind) => {
  if (['activity', 'centre'].includes(kind)) {
    return "Editing activities is not available yet. You can view the centre's activities and opening hours.";
  }
  if (kind === 'availability') {
    return 'Editing availability is not available yet.';
  }
  if (kind === 'adhoc') {
    return 'Ad hoc changes are not available yet.';
  }
  return '';
};
