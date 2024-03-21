const menu = {
  type: "template",
  altText: "功能選單",
  template: {
    type: "buttons",
    thumbnailImageUrl: "https://sportjiojio.site:3000/sportjiojiologo",
    imageAspectRatio: "rectangle",
    imageSize: "cover",
    imageBackgroundColor: "#FFFFFF",
    text: "功能選單",
    defaultAction: {
      type: "uri",
      uri: "https://liff.line.me/2003890387-46rMAQQ",
    },
    actions: [
      {
        type: "uri",
        label: "創建揪揪",
        uri: "https://liff.line.me/2003890387-46rMAQQ",
      },
      {
        type: "uri",
        label: "查看揪揪",
        uri: "https://liff.line.me/2003890387-46rMAQQ",
      },
    ],
  },
};

module.exports = { menu };
