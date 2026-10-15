// Independent safety checks. Pure static checks; do not claim live browser validation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const get = p => fs.readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const deploy = get('base44/functions/deploySite/entry.ts');
const preview = get('base44/functions/provisionPreview/entry.ts');
const validate = get('base44/functions/runValidation/entry.ts');
const renderer = get('base44/shared/siteRenderer.js');
assert.match(deploy,/PRODUCTION_RELEASE_BLOCKED/,'Production must have a dedicated protected release controller');
assert.doesNotMatch(deploy,/target:\s*['"]production['"]/,'Preview API must never select production');
assert.match(deploy,/noindex,nofollow,noarchive/,'Preview HTML must include search exclusions');
assert.match(preview,/independentlyValidated:\s*false/,'Do not assert validation before browser proof');
assert.match(preview,/result:\s*['"]unknown['"]/,'Pending preview receipts must remain UNKNOWN');
assert.match(validate,/Real DOM, contrast and keyboard audit required/,'Blueprint LLM score is not an a11y pass');
assert.match(validate,/real browser screenshot parity is unmeasured/,'Blueprint LLM score is not a visual pass');
assert.match(renderer,/PREMIUM_VISUAL_LOCK_REQUIRED/,'A selected premium master cannot fall back to generic design');
const names=['argent','monolith','atelier'];
for(const name of names){
  const html=get('premium-factory/templates/'+name+'/index.html');
  const css=get('premium-factory/templates/'+name+'/style.css');
  assert.match(html,/<main/,'Full-page source is required: '+name);
  assert.match(css,/@media/,'Responsive source required: '+name);
}
console.log(JSON.stringify({status:'PASS',scope:'static-safety-contract',masters:names,production_released:false,browser_visual_qa:'NOT_TESTED',production_domains_untouched:true},null,2));