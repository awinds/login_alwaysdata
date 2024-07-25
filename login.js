const fs = require('fs');
const puppeteer = require('puppeteer');
const { Client } = require('ssh2');

function formatToISO(date) {
  return date.toISOString().replace('T', ' ').replace('Z', '').replace(/\.\d{3}Z/, '');
}

async function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    // 读取 accounts.json 中的 JSON 字符串
    const accountsJson = fs.readFileSync('accounts.json', 'utf-8');
    console.log(accountsJson);
    const accounts = JSON.parse(accountsJson);

    for (const account of accounts) {
	 try {
		  const { username, password } = account;
		  let url = `ssh-${username}.alwaysdata.net`;
		  // 建立SSH连接
		  const ssh = new Client();
		  await new Promise((resolve, reject) => {
			ssh.on('ready', resolve).on('error', reject).connect({
			  host: url,
			  port: 22,
			  username,
			  password,
			});
		  });
		 
		  // 关闭SSH连接
		  ssh.end();
		  
		  // 获取当前的UTC时间和北京时间
		  const nowUtc = formatToISO(new Date());// UTC时间
		  const nowBeijing = formatToISO(new Date(new Date().getTime() + 8 * 60 * 60 * 1000)); // 北京时间东8区，用算术来搞
		  console.log(`账号 ${username} 于北京时间 ${nowBeijing}（UTC时间 ${nowUtc}）使用SSH登录成功！`);
			
	  } catch (error) {
		console.error(`账号 ${username} 登录时出现错误: ${error}`);
	  }
	  
	  // 用户之间添加随机延时
      const delay = Math.floor(Math.random() * 8000) + 1000; // 随机延时1秒到8秒之间
      await delayTime(delay);
    }
	
    console.log('所有账号登录完成！');
})();

// 自定义延时函数
function delayTime(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
