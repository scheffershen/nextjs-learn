## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## reference 

- https://qufei1993.github.io/nextjs-learn-cn/chapter1
- https://github.com/qufei1993/nextjs-learn-example/blob/main/scripts/seed.js
  

## date

10/2024

## 创建新项目

	$ npx create-next-app@latest nextjs-dashboard --use-npm --example "https://github.com/vercel/next-learn/tree/main/dashboard/starter-example" --legacy-peer-deps

## 文件夹结构

/app：包含应用程序的所有路由、组件和逻辑，这是您将主要从中工作的地方。
/app/lib：包含在应用程序中使用的函数，例如可重用的实用函数和数据获取函数。
/app/ui：包含应用程序的所有 UI 组件，例如卡片、表格和表单。为节省时间，我们已经为您预先样式化了这些组件。
/public：包含应用程序的所有静态资产，例如图片。
/script/：包含一个 seeding（这里翻译为 “播种” 可以理解为数据库的 Migration）脚本，您将在后面的章节中使用它来填充您的数据库。

配置文件：您还会注意到应用程序根目录下有一些配置文件，例如 next.config.js。大多数这些文件在使用 `create-next-app`` 启动新项目时会被创建和预配置。在本课程中，您不需要修改它们。

## 运行开发服务器

	$ npm i --legacy-peer-deps

	$ npm run dev

	$ npm i @vercel/postgres

	$ npm run seed
