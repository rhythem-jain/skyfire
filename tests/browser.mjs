import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Run against npm run dev / preview. This launches an isolated test browser,
// not the user's browser profile. No runtime cheats or simulation hooks.
const base=process.env.SKYFIRE_URL||'http://localhost:5173';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(`${base}/?debug=1`);
  await expect(page.getByRole('button',{name:'DEPLOY TO COMBAT',exact:false})).toBeVisible();
  await page.waitForTimeout(1600);
  await page.screenshot({path:'test-results/menu.png'});
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.locator('#quality').selectOption('medium');
  await page.getByRole('checkbox',{name:'Reduced camera shake'}).check();
  await page.getByRole('button',{name:'Rebind Aim + cannon',exact:true}).click();
  await page.keyboard.press('KeyF');
  await page.getByRole('button',{name:'SAVE CONFIGURATION',exact:false}).click();
  await page.reload();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await expect(page.locator('#quality')).toHaveValue('medium');
  await expect(page.getByRole('button',{name:'Rebind Aim + cannon',exact:true})).toHaveText('F');
  await page.screenshot({path:'test-results/settings.png'});
  await page.getByRole('button',{name:'Close settings',exact:true}).click();
  await page.getByRole('button',{name:'DEPLOY TO COMBAT',exact:false}).click();
  await expect(page.locator('#timer')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.keyboard.down('KeyE');
  try {
    await expect.poll(async()=>Number(await page.locator('#altitude').textContent()),{timeout:20000}).toBeGreaterThan(26);
  } finally {await page.keyboard.up('KeyE');}
  await page.screenshot({path:'test-results/combat.png'});
  console.log('Render counters:',await page.locator('#debug').textContent());
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Holding position.'})).toBeVisible();
  const pausedTime=await page.locator('#timer').textContent();await page.waitForTimeout(1000);
  await expect(page.locator('#timer')).toHaveText(pausedTime);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Holding position.'})).not.toBeVisible();
  const previousTarget=await page.locator('.target.selected').getAttribute('id');
  await page.keyboard.press('Tab');
  await expect(page.locator('.target.selected')).not.toHaveAttribute('id',previousTarget,{timeout:20000});
  await expect(page.locator('#lock-label')).toHaveText('TARGET LOCKED / MISSILE READY',{timeout:20000});
  await page.keyboard.press('KeyK');
  await expect(page.locator('#ammo')).toHaveText('07',{timeout:10000});
  await page.keyboard.press('Space');
  await expect(page.locator('#flares')).toHaveText('02');
  await page.keyboard.down('KeyF');
  await expect(page.getByRole('heading',{name:'Airspace secured.'})).toBeVisible({timeout:90000});
  await page.keyboard.up('KeyF');
  await page.screenshot({path:'test-results/debrief.png'});
  await expect(page.locator('.result-grid')).toContainText('6 / 6');
  await page.getByRole('button',{name:'FLY ANOTHER SORTIE',exact:false}).click();
  await expect(page.locator('#objective-count')).toHaveText('0 / 6');
  await expect(page.locator('#health')).toHaveText('100');
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'ABORT TO MAIN MENU'}).click();
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(500);
  await expect(page.getByRole('button',{name:'DEPLOY TO COMBAT',exact:false})).toBeInViewport();
  await page.screenshot({path:'test-results/menu-mobile.png'});
  expect(errors).toEqual([]);
  console.log('PASS: menu, settings persistence/remap, deploy, flight, pause/resume, missile, flare, live combat victory, debrief, retry, responsive menu; no page errors.');
} catch(error) {
  await page.screenshot({path:'test-results/failure.png'});
  console.error('Page errors:',errors);throw error;
} finally {await browser.close();}
