import requestDeadline from 'app/utility/requestDeadline';
import { currentUserId } from 'app/utility/medicationAdminister';

export const writePersonalProfile = async ({
  api,
  actor,
  name,
  contact,
  isCurrent = () => true,
}) => {
  const payload = {
    preferredName: String(name || '').trim(),
    contactNo: String(contact || '').trim(),
  };
  if (
    !actor ||
    !payload.preferredName ||
    !/^[689]\d{7}$/.test(payload.contactNo)
  ) {
    return {
      outcome: 'rejected',
      message:
        'Enter your preferred name and a valid8-digit contact number starting with6,8 or9.',
    };
  }
  if (!isCurrent()) {
    return { outcome: 'stale' };
  }
  let submitted = false;
  try {
    const before = await requestDeadline(api.getUser());
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    if (!before?.ok || String(currentUserId(before.data)) !== actor) {
      return {
        outcome: 'rejected',
        message:
          'Your account could not be verified. Return to Personal Information and reload it.',
      };
    }
    submitted = true;
    const response = await requestDeadline(api.updateUser(payload));
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    if (!response?.ok && response?.status >= 400 && response.status < 500) {
      return {
        outcome: 'rejected',
        message:
          'The change was rejected. Reload your personal information before trying again.',
      };
    }
    if (!response?.ok) {
      throw new Error('Unconfirmed save');
    }
    const after = await requestDeadline(api.getUser());
    if (!isCurrent()) {
      return { outcome: 'stale' };
    }
    if (
      !after?.ok ||
      String(currentUserId(after.data)) !== actor ||
      after.data.preferredName !== payload.preferredName ||
      after.data.contactNo !== payload.contactNo
    ) {
      throw new Error('Readback mismatch');
    }
    return { outcome: 'verified' };
  } catch {
    return {
      outcome: !isCurrent() ? 'stale' : submitted ? 'uncertain' : 'rejected',
      message:
        'The saved outcome could not be confirmed. Reload Personal Information before making another change.',
    };
  }
};
