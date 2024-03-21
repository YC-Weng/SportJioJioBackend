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
      uri: "https://liff.line.me/2003890387-46rMAvQQ",
    },
    actions: [
      {
        type: "uri",
        label: "創建揪揪",
        uri: "https://liff.line.me/2003890387-46rMAvQQ",
      },
      {
        type: "uri",
        label: "查看揪揪",
        uri: "https://liff.line.me/2003890387-46rMAvQQ",
      },
    ],
  },
};

module.exports = { menu };
