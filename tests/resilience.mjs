import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base=process.env.SKYFIRE_URL||'http://localhost:5173';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1000,height:700}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(base);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.locator('#quality').selectOption('low');
  await page.getByRole('button',{name:'Rebind Aim + cannon',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Make it yours.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Rebind Aim + cannon',exact:true})).toHaveText('J');
  await page.getByRole('button',{name:'SAVE CONFIGURATION',exact:false}).click();
  await page.getByRole('button',{name:'DEPLOY TO COMBAT',exact:false}).click();
  // Track the live target frame using pointer input, not simulation internals.
  await page.mouse.down();
  const until=Date.now()+30000;
  while(await page.locator('#objective-count').textContent()==='0 / 6'&&Date.now()<until){
    const box=await page.locator('.target.selected').boundingBox();
    if(box)await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
    await page.waitForTimeout(120);
  }
  await page.mouse.up();
  await expect(page.locator('#objective-count')).not.toHaveText('0 / 6');
  // A synthetic focus-loss event exercises the production event handler.
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('heading',{name:'Holding position.'})).toBeVisible();
  await page.getByRole('button',{name:'RESUME FLIGHT',exact:false}).click();
  await expect(page.getByRole('heading',{name:'End of the line.'})).toBeVisible({timeout:150000});
  await page.screenshot({path:'test-results/defeat.png'});
  await expect(page.locator('.result-grid')).toContainText('0%');
  await page.getByRole('button',{name:'RETURN TO OPERATIONS'}).click();
  await page.reload();
  await page.getByRole('button',{name:'CREDITS & INFO'}).click();
  await expect(page.locator('.info-box')).toContainText(/PERSONAL BEST: [1-9]/);
  await page.getByRole('button',{name:'BACK TO OPERATIONS',exact:false}).click();
  // Deliberate test fault injection: lose the WebGL context, never alter game state.
  await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(page.getByRole('heading',{name:'Graphics connection lost.'})).toBeVisible();
  await page.screenshot({path:'test-results/context-loss.png'});
  await page.evaluate(()=>localStorage.setItem('skyfire.save','{broken save'));
  await page.reload();
  await expect(page.getByRole('button',{name:'DEPLOY TO COMBAT',exact:false})).toBeVisible();
  await page.getByRole('button',{name:'CREDITS & INFO'}).click();
  await expect(page.locator('.info-box')).toContainText('PERSONAL BEST: 0');
  expect(errors).toEqual([]);
  console.log('PASS: remap cancel, mouse cannon kill, synthetic blur pause, natural enemy-fire defeat, best-score persistence, synthetic WebGL context loss, corrupt save recovery; no page errors.');
} catch(error){await page.screenshot({path:'test-results/resilience-failure.png'});console.error(errors);throw error;}
finally{await browser.close();}
