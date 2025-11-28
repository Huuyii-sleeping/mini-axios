# min-axios

这个库主要是为了加深对axios的理解，做的一个小型的mini-axios(其实也不算小了，该有的内容基本都有)

## 功能特点
 - 提供了类似于axios的基本功能，执行各种请求的过程
 - 支持拦截器功能，用户可以在发送请求以及处理响应之前自定义操作
 - 借鉴axios源码，利用promise链式调用
 - 支持请求并发
 - 请求取消
 - 自定义配置选项
 - 自定义适配器 xhr fetch http之类的

 ## 安装
 ```
git clone https://github.com/Huuyii-sleeping/mini-axios.git

pnpm install 
 ```

## 快速开始
```
import axios from 'toy-axios';

// 发起一个 GET 请求
axios.get('/api/data').then((response) => {
  console.log(response.data);
}).catch((error) => {
  console.error(error);
});
```
