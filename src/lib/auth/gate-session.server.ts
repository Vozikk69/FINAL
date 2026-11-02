/** Gate identity sessions disabled — custom DB auth only. */
export function gateIdentitySessions() {
  return {
    id: "gate-identity-sessions-noop",
    hooks: {},
  };
}
