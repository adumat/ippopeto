import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs=[]
        ctx = await b.new_context(viewport={"width":390,"height":844}, has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8080/")
        await asyncio.sleep(1)
        print("url", pg.url)
        await pg.screenshot(path="./m0.png")
        await pg.fill("#name","Matteo"); await pg.click("button[type=submit]")
        await asyncio.sleep(1)
        await pg.screenshot(path="./m1.png")
        print("errors", errs)
        await b.close()
asyncio.run(main())
