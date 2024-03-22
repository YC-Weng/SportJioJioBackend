const frontend_url = "https://liff.line.me/2003890387-36qLbEdd";

const menu_group = (groupId) => {
  return {
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
        uri: `${frontend_url}?groupId=${groupId}`,
      },
      actions: [
        {
          type: "postback",
          label: "建立帳號",
          data: `action=createuser&groupId=${groupId}`,
        },
        {
          type: "uri",
          label: "創建揪揪",
          uri: `${frontend_url}/createjiojio?groupId=${groupId}`,
        },
        {
          type: "uri",
          label: "查看揪揪",
          uri: `${frontend_url}/listjiojio?groupId=${groupId}`,
        },
      ],
    },
  };
};

module.exports = { menu_group };
