import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        errs=[]
        pages=[]
        for i,name in enumerate(["Matteo","Giulia","Luca"]):
            ctx = await b.new_context(viewport={"width":1280,"height":800})
            pg = await ctx.new_page()
            pg.on("pageerror", lambda e, n=name: errs.append(f"{n}: {e}"))
            pg.on("console", lambda m, n=name: errs.append(f"{n} console {m.type}: {m.text}") if m.type in ("error","warning") else None)
            await pg.goto("http://localhost:8080/?room=prova-test-1")
            pages.append(pg)
        await asyncio.sleep(1.5)
        await pages[0].screenshot(path="./s0_splash.png")
        for pg,name in zip(pages,["Matteo","Giulia","Luca"]):
            await pg.fill("#name", name); await pg.click("button[type=submit]")
        await asyncio.sleep(1)
        # practice: all fart
        for pg in pages: await pg.keyboard.down("Space")
        await asyncio.sleep(0.8)
        await pages[0].screenshot(path="./s1_lobby.png")
        for pg in pages: await pg.keyboard.up("Space")
        await pages[0].click("#start")
        await asyncio.sleep(1.2)
        await pages[1].screenshot(path="./s2_countdown.png")
        await asyncio.sleep(2.5)
        await pages[0].keyboard.down("KeyD")
        for pg in pages: await pg.keyboard.down("Space")
        await asyncio.sleep(0.25)
        await pages[0].keyboard.up("KeyD")
        await asyncio.sleep(1.8)
        await pages[0].screenshot(path="./s3_run.png")
        for pg in pages: await pg.keyboard.up("Space")
        print("errors:", errs[:20])
        await b.close()
asyncio.run(main())
