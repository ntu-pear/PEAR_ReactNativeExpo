import Constants from 'expo-constants';

// Internal staging QA builds only. Normal version names never emit timings.
const enabled = () => /-qa\./.test(String(Constants.nativeAppVersion || ''));
const operations = new Set([
  'profile',
  'patient-read',
  'guardian-read',
  'social-read',
  'selection-read',
  'reveal-read',
]);
const phases = new Set([
  'start',
  'response',
  'error',
  'data-ready',
  'layout-ready',
  'blur',
]);
let sequence = 0;

const clock = () =>
  typeof global.performance?.now === 'function'
    ? { value: global.performance.now(), kind: 'monotonic' }
    : { value: Date.now(), kind: 'wall' };

const emit = (span, phase, values = {}) => {
  if (!enabled() || !span || !phases.has(phase) || span.reported.has(phase)) {
    return;
  }
  span.reported.add(phase);
  const now = clock();
  // Construct a strict numeric/enum payload. Never spread API/request objects,
  // headers, URLs, input, identifiers, error messages or patient content.
  const payload = {
    operation: span.operation,
    span: span.sequence,
    phase,
    elapsedMs: Math.round(Math.max(0, now.value - span.started) * 100) / 100,
    clock: span.clock,
  };
  if (span.parent != null) {
    payload.parent = span.parent;
  }
  const status = Number(values.status);
  if (Number.isInteger(status) && status >= 100 && status <= 599) {
    payload.status = status;
  }
  const duration = values.requestDurationMs;
  if (
    typeof duration === 'number' &&
    Number.isFinite(duration) &&
    duration >= 0
  ) {
    payload.requestDurationMs = Math.round(duration * 100) / 100;
  }
  console.log('[PEAR_PERF]', JSON.stringify(payload));
};

export const beginQaTiming = (operation, parent = null) => {
  if (!enabled() || !operations.has(operation)) {
    return null;
  }
  const now = clock();
  const span = {
    operation,
    sequence: ++sequence,
    parent: Number.isInteger(parent?.sequence) ? parent.sequence : null,
    started: now.value,
    clock: now.kind,
    reported: new Set(),
  };
  emit(span, 'start');
  return span;
};

export const markQaTiming = (span, phase, values) => emit(span, phase, values);
