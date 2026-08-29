/**
 * ============================================
 * PASSWORD STRENGTH INDICATOR COMPONENT
 * ============================================
 * 
 * Purpose: Shows password strength with a colored progress bar
 * Features:
 * - Evaluates password against 4 criteria
 * - Color-coded bar (red → yellow → blue → green)
 * - Width animation with transitions
 * - Strength label display
 * - Empty state handling (returns null)
 * 
 * Scoring (0-4), one point each for:
 *   1. length >= 8
 *   2. has lowercase AND uppercase
 *   3. has a number
 *   4. has a special character
 * 
 * Dependencies:
 * - None (pure component)
 * 
 * Usage:
 * <Input ... value={form.password} onChange={handleChange} />
 * <PasswordStrength password={form.password} />
 * ============================================
 */

/**
 * ============================================
 * STRENGTH LEVELS CONFIGURATION
 * ============================================
 * 
 * Maps score (0-4) to visual properties
 * Explicit lookup table — no dynamic class building (Tailwind v4 rule)
 * 
 * @constant {Object} STRENGTH_LEVELS
 * @property {Object} 0 - Empty/no password
 * @property {Object} 1 - Weak (red)
 * @property {Object} 2 - Fair (yellow)
 * @property {Object} 3 - Good (blue/brand)
 * @property {Object} 4 - Strong (green/success)
 */
const STRENGTH_LEVELS = {
  0: { label: '', width: 'w-0', bar: 'bg-transparent', text: 'text-transparent' },
  1: { label: 'Weak', width: 'w-1/4', bar: 'bg-danger-text', text: 'text-danger-text' },
  2: { label: 'Fair', width: 'w-2/4', bar: 'bg-warning-text', text: 'text-warning-text' },
  3: { label: 'Good', width: 'w-3/4', bar: 'bg-brand-primary', text: 'text-brand-primary' },
  4: { label: 'Strong', width: 'w-full', bar: 'bg-success-text', text: 'text-success-text' },
};

/**
 * ============================================
 * GET PASSWORD SCORE
 * ============================================
 * 
 * Evaluates password against 4 criteria
 * Each criterion adds 1 point
 * 
 * @param {string} password - The password to evaluate
 * @returns {number} Score from 0 to 4
 * 
 * @example
 * getScore('abc123') // 2 (length + number)
 * getScore('Abc123!@#') // 4 (all criteria met)
 * getScore('') // 0
 */
function getScore(password) {
  if (!password) return 0;

  let score = 0;
  // 1. Length check (>= 8 characters)
  if (password.length >= 8) score += 1;
  // 2. Case check (has both lowercase AND uppercase)
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  // 3. Number check (has at least one digit)
  if (/[0-9]/.test(password)) score += 1;
  // 4. Special character check (non-alphanumeric)
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

/**
 * ============================================
 * PASSWORD STRENGTH COMPONENT
 * ============================================
 * 
 * Renders a strength indicator bar with label
 * 
 * @param {Object} props - Component props
 * @param {string} props.password - The password value to evaluate
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element|null} Password strength indicator or null if empty
 * 
 * @example
 * // In a form with password input
 * const [password, setPassword] = useState('');
 * 
 * <Input
 *   type="password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * <PasswordStrength password={password} />
 * ============================================
 */
function PasswordStrength({ password, className = '' }) {
  // Return null if password is empty
  if (!password) return null;

  const score = getScore(password);
  const level = STRENGTH_LEVELS[score];

  return (
    <div className={['space-y-1', className].join(' ')}>
      {/* ─── Progress Track + Filled Bar ─── */}
      <div className="h-1.5 w-full overflow-hidden md:block md:hidden rounded-full bg-surface-dim px-4 sm:px-6 lg:px-8">
        <div
          className={[
            'h-full rounded-full transition-all duration-300',
            level.width,
            level.bar,
          ].join(' ')}
        />
      </div>

      {/* ─── Strength Label ─── */}
      <p className={['text-xs font-medium', level.text].join(' ')}>
        {level.label}
      </p>
    </div>
  );
}

export default PasswordStrength;