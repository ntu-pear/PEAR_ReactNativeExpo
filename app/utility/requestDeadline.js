// Include auth/storage work in the deadline, not just the HTTP transport.
export default function requestDeadline(request, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(
        'Request timed out. Check the VPN connection and try again.',
      );
      error.problem = 'TIMEOUT_ERROR';
      reject(error);
    }, timeoutMs);
    Promise.resolve(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
