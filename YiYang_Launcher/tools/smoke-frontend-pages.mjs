import { chromium } from "playwright-core";

const baseUrl = process.env.YIYANG_FRONTEND_URL || "http://localhost:5173";
const chromePath =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const mobile = process.env.YIYANG_TEST_MOBILE || "19100001910";
const password = process.env.YIYANG_TEST_PASSWORD || "123456";

const routes = [
  { path: "/dashboard", title: "东软颐养中心运营看板", actions: [] },
  {
    path: "/customer/user",
    title: "用户与客户档案",
    actions: [
      "新建客户档案",
      { name: "新建员工账号", beforeText: "员工账号" },
      "编辑",
    ],
  },
  {
    path: "/customer/bed",
    title: "房间与床位管理",
    actions: ["新建床位", { name: "新建房间", beforeText: "房间列表" }, "编辑"],
  },
  { path: "/customer/meal", title: "客户膳食方案", actions: ["新建膳食方案", "编辑"] },
  { path: "/customer/meal-calendar", title: "每周伙食菜单", actions: ["新建周菜单", "编辑"] },
  { path: "/customer/check-in", title: "入住登记", actions: ["办理入住"] },
  { path: "/customer/check-out", title: "退住登记", actions: ["办理退住"] },
  {
    path: "/customer/outing",
    title: "外出登记",
    actions: ["新增外出", { name: "归院登记", allowDisabled: true }],
  },
  {
    path: "/customer/service-target",
    title: "客户与健康管家关系",
    actions: ["新建服务对象关系", "编辑"],
  },
  {
    path: "/customer/service-focus",
    title: "客户购买服务信息",
    actions: ["新建服务信息", "编辑"],
  },
  { path: "/nursing/care-level", title: "护理级别定义", actions: ["新建护理级别", "编辑"] },
  { path: "/nursing/care-item", title: "护理内容配置", actions: ["新建护理内容", "编辑"] },
  {
    path: "/nursing/care-record",
    title: "护理记录录入",
    actions: [{ name: "新建护理记录", dialogActions: ["AI生成护理小结"] }, "编辑"],
  },
];

const failures = [];
const observations = [];
let currentRoute = "startup";

function rememberFailure(type, message, route = currentRoute) {
  failures.push({ route, type, message });
}

async function closeDialogIfOpen(page) {
  const cancel = page.getByRole("button", { name: /取消|关闭/ }).last();

  if (await cancel.isVisible().catch(() => false)) {
    await cancel.click();
    await page.waitForTimeout(500);
    return;
  }

  const close = page.locator(".el-dialog__headerbtn").last();

  if (await close.isVisible().catch(() => false)) {
    await close.click();
    await page.waitForTimeout(500);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function login(page) {
  currentRoute = "/auth/login";
  await page.goto(`${baseUrl}/auth/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("请输入手机号码").fill(mobile);
  await page.getByPlaceholder("请输入登录密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();
  await page.waitForTimeout(1500);

  const token = await page.evaluate(() => localStorage.getItem("auth_token"));

  if (!token || page.url().includes("/auth/login")) {
    throw new Error(`Login failed, current url: ${page.url()}`);
  }
}

async function clickAction(page, actionConfig) {
  const action =
    typeof actionConfig === "string" ? { name: actionConfig } : actionConfig;

  if (action.beforeText) {
    const textTarget = page.getByText(action.beforeText, { exact: true }).first();

    if (await textTarget.isVisible().catch(() => false)) {
      await textTarget.click();
      await page.waitForTimeout(250);
    } else {
      observations.push({
        route: currentRoute,
        type: "missing-precondition",
        message: `Text not found before action ${action.name}: ${action.beforeText}`,
      });
    }
  }

  const button = page
    .getByRole("button", { name: new RegExp(escapeRegExp(action.name)) })
    .first();

  if (!(await button.isVisible().catch(() => false))) {
    observations.push({
      route: currentRoute,
      type: "missing-action",
      message: `Button not found: ${action.name}`,
    });
    return;
  }

  const isDisabled = await button.isDisabled().catch(() => false);

  if (isDisabled && action.allowDisabled) {
    observations.push({
      route: currentRoute,
      type: "disabled-action",
      message: `${action.name}: visible but disabled`,
    });
    return;
  }

  if (isDisabled) {
    rememberFailure("disabled-action", `${action.name}: visible but disabled`);
    return;
  }

  try {
    await button.click({ timeout: 8000 });
  } catch (error) {
    rememberFailure("action-click", `${action.name}: ${error.message}`);
    await closeDialogIfOpen(page);
    return;
  }

  await page.waitForTimeout(400);

  const hasDialog = await page.locator(".el-dialog").last().isVisible().catch(() => false);

  if (hasDialog && action.dialogActions?.length) {
    for (const dialogAction of action.dialogActions) {
      const dialogButton = page
        .locator(".el-dialog")
        .last()
        .getByRole("button", { name: new RegExp(escapeRegExp(dialogAction)) })
        .first();

      if (!(await dialogButton.isVisible().catch(() => false))) {
        observations.push({
          route: currentRoute,
          type: "missing-dialog-action",
          message: `Button not found in dialog: ${dialogAction}`,
        });
        continue;
      }

      try {
        await dialogButton.click({ timeout: 8000 });
        await page.waitForTimeout(400);
        observations.push({
          route: currentRoute,
          type: "dialog-action",
          message: `${dialogAction}: clicked`,
        });
      } catch (error) {
        rememberFailure("dialog-action-click", `${dialogAction}: ${error.message}`);
      }
    }
  }

  observations.push({
    route: currentRoute,
    type: "action",
    message: `${action.name}: ${hasDialog ? "opened dialog" : "clicked"}`,
  });

  await closeDialogIfOpen(page);
}

async function inspectRoute(page, route) {
  currentRoute = route.path;
  const beforeFailureCount = failures.length;
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  if (!page.url().includes(route.path)) {
    rememberFailure("route", `Expected ${route.path}, got ${page.url()}`);
  }

  const bodyText = await page.locator("body").innerText();

  if (!bodyText.includes(route.title)) {
    rememberFailure("content", `Missing page title text: ${route.title}`);
  }

  for (const action of route.actions) {
    await clickAction(page, action);
  }

  const tables = await page.locator(".el-table").count();
  const rows = await page.locator(".el-table__body-wrapper tbody tr").count();
  observations.push({
    route: route.path,
    type: "page",
    message: `tables=${tables}, rows=${rows}, newIssues=${failures.length - beforeFailureCount}`,
  });
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  page.on("console", (message) => {
    if (message.type() === "error") {
      rememberFailure("console-error", message.text());
    }
  });

  page.on("pageerror", (error) => {
    rememberFailure("page-error", error.message);
  });

  page.on("requestfailed", (request) => {
    rememberFailure("network-failed", `${request.failure()?.errorText || "failed"} ${request.url()}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      rememberFailure("http-5xx", `${response.status()} ${response.url()}`);
    }
  });

  await login(page);

  for (const route of routes) {
    await inspectRoute(page, route);
  }
} finally {
  await browser.close();
}

const report = {
  baseUrl,
  checkedRoutes: routes.map((route) => route.path),
  failures,
  observations,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  process.exit(1);
}
