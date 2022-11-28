import { User, Work } from "../ismism.ts/src/typ.ts";

function rand_utc(
	utc: number
): number {
	return utc + Math.round(Math.random() * 10000) - 5000
}

const user: User[] = JSON.parse(Deno.readTextFileSync("dbimport/user.json"))
const uid_by_name = new Map(user.map(u => [u.name, u._id]))

const activity = [
	{ aid: 1, date: "2021-04-03 12:00", uid: "川羽", op: "work", msg: "魔怔人论坛上线" },
	{ aid: 1, date: "2021-05-28 12:00", uid: "川羽", op: "work", msg: "魔怔人论坛内测结束" },
	{ aid: 1, date: "2022-07-04 01:38", uid: "未明子", op: "video", title: "【实践】我的行动路径——我卖什么货，我开什么店，我成立什么团体，我追求什么理想", src: "https://www.bilibili.com/video/BV1if4y1Z7xo" },
	{ aid: 1, date: "2022-08-01 01:46", uid: "未明子", op: "video", title: "【公告】我们眼下的行动路径", src: "https://www.bilibili.com/video/BV1wa411M7jK" },
	{ aid: 1, date: "2022-08-14 01:45", uid: "未明子", op: "video", title: "【行动计划】我们打算做一个什么样的网站（1）——初步功能", src: "https://www.bilibili.com/video/BV1EG411t7Wh" },
	{ aid: 1, date: "2022-09-05 12:00", uid: "万大可", op: "work", msg: "主义主义活动公示网站上线" },
	{ aid: 1, date: "2022-09-07 02:45", uid: "未明子", op: "video", title: "【项目追踪】主义主义网站（临时站点）目前的功能：首批项目内容的简单公示", src: "https://www.bilibili.com/video/BV1r14y1s75s" },
	{ aid: 1, date: "2022-11-28 14:00", uid: "万大可", op: "work", msg: "网站更新：用户与社团页面" },

	{ aid: 2, date: "2022-08-04 14:35", uid: "张正午", op: "video", title: "工人子弟晚托班苏州星星家园环境改造/伙食改善公益项目工作记录", src: "https://www.bilibili.com/video/BV1zT411L7JP" },
	{ aid: 2, date: "2022-08-04 22:17", uid: "未明子", op: "video", title: "【现实行动】我们目前的一个行动项目", src: "https://www.bilibili.com/video/BV1xG4y1v7MV" },
	{ aid: 2, date: "2022-09-07 02:45", uid: "未明子", op: "video", title: "【项目追踪】主义主义网站（临时站点）目前的功能：首批项目内容的简单公示", src: "https://www.bilibili.com/video/BV1r14y1s75s" },
	{ aid: 2, date: "2022-09-09 04:05", uid: "未明子", op: "video", title: "【项目追踪】晚托班环境改造成果展示预览版（直播讲解版）", src: "https://www.bilibili.com/video/BV19d4y1g7Hc" },

	{ aid: 3, date: "2022-08-04 14:35", uid: "张正午", op: "video", title: "工人子弟晚托班苏州星星家园环境改造/伙食改善公益项目工作记录", src: "https://www.bilibili.com/video/BV1zT411L7JP" },
	{ aid: 3, date: "2022-08-04 22:17", uid: "未明子", op: "video", title: "【现实行动】我们目前的一个行动项目", src: "https://www.bilibili.com/video/BV1xG4y1v7MV" },
	{ aid: 3, date: "2022-08-17 00:37", uid: "未明子", op: "video", title: "【项目跟踪】晚托班项目硬装计划介绍", src: "https://www.bilibili.com/video/BV1dg41167Y9" },
	{ aid: 3, date: "2022-08-23 00:46", uid: "未明子", op: "video", title: "【项目追踪】晚托班改造计划硬装部分阶段性介绍", src: "https://www.bilibili.com/video/BV1eB4y1z7Qc" },

	{ aid: 3, date: "2022-08-31 20:00", uid: "张东冬", op: "work", msg: "在八月 27 - 28 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "盛航航", op: "work", msg: "在八月 26 - 31 日共参与施工 6 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "刘源", op: "work", msg: "在八月 24 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "许沛洋", op: "work", msg: "在八月 23 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张恒光", op: "work", msg: "在八月 23 - 30 日共参与施工 8 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "李思源", op: "work", msg: "在八月 23 - 24 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "朱宏基", op: "work", msg: "在八月 23 - 25 日共参与施工 3 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "郑昊", op: "work", msg: "在八月 23 - 24 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "应一楷", op: "work", msg: "在八月 22 - 24 日共参与施工 3 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "田浩楠", op: "work", msg: "在八月 22 - 26, 28 日共参与施工 6 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "孙陆钧", op: "work", msg: "在八月 22 - 23 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张洲", op: "work", msg: "在八月 22 - 25 日共参与施工 4 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "刘叙辰", op: "work", msg: "在八月 22 - 24 日共参与施工 3 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "庞哲昊", op: "work", msg: "在八月 21 - 28, 30 - 31 日共参与施工 10 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "燕少昕", op: "work", msg: "在八月 21 - 23, 28 - 29, 30 日共参与施工 6 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "胡明达", op: "work", msg: "在八月 21 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张成昊", op: "work", msg: "在八月 21 - 30 日共参与施工 10 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "陆毅", op: "work", msg: "在八月 21 - 33 日共参与施工 3 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "辛子豪", op: "work", msg: "在八月 21 - 22 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "马琳娜", op: "work", msg: "在八月 21, 27 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "梁卫天", op: "work", msg: "在八月 21 - 28 日共参与施工 8 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "沙名轩", op: "work", msg: "在八月 21, 23 - 25 日共参与施工 4 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "纪培煜", op: "work", msg: "在八月 21, 27 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "斯通", op: "work", msg: "在八月 21 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "陆一帜", op: "work", msg: "在八月 21 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张济达", op: "work", msg: "在八月 21, 28 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "曹子函", op: "work", msg: "在八月 21 - 22 日共参与施工 2 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张明明", op: "work", msg: "在八月 21, 23, 25 日共参与施工 3 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "张超培", op: "work", msg: "在八月 21 - 30 日共参与施工 10 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "谢宇", op: "work", msg: "在八月 22, 24 - 25, 27 - 28 日共参与施工 5 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "蔡思忘", op: "work", msg: "在八月 22 - 24, 26 - 27, 29 日共参与施工 6 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "用户132", op: "work", msg: "在八月 27 日共参与施工 1 天" },
	{ aid: 3, date: "2022-08-31 20:00", uid: "赵贺", op: "work", msg: "在八月 27 - 28 日共参与施工 2 天" },
	{ aid: 3, date: "2022-09-07 20:00", uid: "未明子", op: "video", title: "【项目追踪】主义主义网站（临时站点）目前的功能：首批项目内容的简单公示", src: "https://www.bilibili.com/video/BV1r14y1s75s" },
	{ aid: 3, date: "2022-09-09 20:00", uid: "未明子", op: "video", title: "【项目追踪】晚托班环境改造成果展示预览版（直播讲解版）", src: "https://www.bilibili.com/video/BV19d4y1g7Hc" },
	{ aid: 3, date: "2022-09-13 20:00", uid: "未明子", op: "video", title: "【项目追踪】爱心小屋改造全纪实", src: "https://www.bilibili.com/video/BV1Cd4y1u7Ya" },

	{ aid: 4, date: "2022-09-18 03:35", uid: "未明子", op: "video", title: "【工益公益】我们团队的总路线：以工益带动公益；我们的第一个实践计划：工益食堂", src: "https://www.bilibili.com/video/BV1wG4y1B7cK" },
	{ aid: 4, date: "2022-09-26 08:11", uid: "未明子", op: "video", title: "【工益公益】接下来的项目：营养星期四，请社会的主人们来做客吃饭", src: "https://www.bilibili.com/video/BV1Fe4y1H7Vy" },
	{ aid: 4, date: "2022-09-30 23:42", uid: "未明子", op: "video", title: "【工益公益】我们目前工作发展的瓶颈和困境", src: "https://www.bilibili.com/video/BV1tN4y1P742" },
	{ aid: 4, date: "2022-10-01 00:18", uid: "未明子", op: "video", title: "【工益公益】工益是最大的公益", src: "https://www.bilibili.com/video/BV1xe411T7Fb" },
	{ aid: 4, date: "2022-10-09 01:52", uid: "未明子", op: "video", title: "【项目追踪】营养星期四项目准备期的第一个问题以及一些其他情况的介绍", src: "https://www.bilibili.com/video/BV18m4y1A77W" },
	{ aid: 4, date: "2022-10-20 01:53", uid: "未明子", op: "video", title: "【工益公益】营养星期四项目跟踪之厨房改造", src: "https://www.bilibili.com/video/BV1FR4y197U8" },
	{ aid: 4, date: "2022-11-16 04:56", uid: "未明子", op: "video", title: "【行动路线】我们的道路（近-中-远），以及我两年来的财务状况", src: "https://www.bilibili.com/video/BV1FW4y1x792" },


	{ aid: 4, date: "2022-10-19 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：拆墙面（全天）" },
	{ aid: 4, date: "2022-10-20 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：油烟机清洗（全天）" },
	{ aid: 4, date: "2022-10-22 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：拆顶部墙板（全天）" },
	{ aid: 4, date: "2022-11-12 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：美缝（全天）" },
	{ aid: 4, date: "2022-11-13 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：美缝，装油烟机，打包快递（全天）" },
	{ aid: 4, date: "2022-11-14 20:00", uid: "盛航航", op: "work", msg: "本日工作内容：买油烟管道（全天）" },

	{ aid: 4, date: "2022-10-12 20:00", uid: "庞哲昊", op: "work", msg: "本日工作内容：检查管道（3小时）" },
	{ aid: 4, date: "2022-10-15 20:00", uid: "庞哲昊", op: "work", msg: "本日工作内容：清洗厨房物具（白天）" },

	{ aid: 4, date: "2022-11-12 20:00", uid: "梁卫天", op: "work", msg: "本日工作内容：打扫卫生，包徽章快递（7小时）" },
	{ aid: 4, date: "2022-11-13 20:00", uid: "梁卫天", op: "work", msg: "本日工作内容：拍摄，挪东西，包徽章快递（全天）" },

	{ aid: 4, date: "2022-10-15 20:00", uid: "田浩楠", op: "work", msg: "本日工作内容：拆除原有木板，清洗厨具（全天）" },
	{ aid: 4, date: "2022-10-18 20:00", uid: "田浩楠", op: "work", msg: "本日工作内容：搬运轻质砖水泥瓷砖（6小时）" },
	{ aid: 4, date: "2022-10-22 20:00", uid: "田浩楠", op: "work", msg: "本日工作内容：搬运轻质砖水泥瓷砖（6小时）" },
	{ aid: 4, date: "2022-11-13 20:00", uid: "田浩楠", op: "work", msg: "本日工作内容：包徽章快递（5小时）" },

	{ aid: 4, date: "2022-10-15 20:00", uid: "蔡思忘", op: "work", msg: "本日工作内容：清洗厨房物具（3小时）" },
	{ aid: 4, date: "2022-10-22 20:00", uid: "蔡思忘", op: "work", msg: "本日工作内容：搬砖（3小时）" },
	{ aid: 4, date: "2022-11-01 20:00", uid: "蔡思忘", op: "work", msg: "本日工作内容：搬砖（3小时）" },
	{ aid: 4, date: "2022-11-09 20:00", uid: "蔡思忘", op: "work", msg: "本日工作内容：美缝（2小时）" },

	{ aid: 4, date: "2022-10-19 20:00", uid: "陆毅", op: "work", msg: "本日工作内容：拆除原有墙板（3小时）" },

	{ aid: 4, date: "2022-10-12 20:00", uid: "沙名轩", op: "work", msg: "本日工作内容：量尺寸绘图（1小时）" },
	{ aid: 4, date: "2022-11-11 20:00", uid: "沙名轩", op: "work", msg: "本日工作内容：贴美缝纸（2小时）" },
	{ aid: 4, date: "2022-11-12 20:00", uid: "沙名轩", op: "work", msg: "本日工作内容：贴美缝纸包徽章快递（4小时）" },

	{ aid: 4, date: "2022-11-12 20:00", uid: "杨景然", op: "work", msg: "在 10月12日 至 11月12日 期间参与施工，零散时间拍摄记录设备监控，11月13日及之后由梁卫天接手" },

	{ aid: 4, date: "2022-11-11 20:00", uid: "朱同方", op: "work", msg: "本日工作内容：美缝（约3小时）" },
	{ aid: 4, date: "2022-11-12 20:00", uid: "朱同方", op: "work", msg: "本日工作内容：美缝，包徽章快递（约8小时）" },
	{ aid: 4, date: "2022-11-13 20:00", uid: "朱同方", op: "work", msg: "本日工作内容：挪东西包徽章快递（约7小时）" },

	{ aid: 4, date: "2022-10-20 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：油烟机清洗（全天）" },
	{ aid: 4, date: "2022-10-21 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：拆墙板（全天）" },
	{ aid: 4, date: "2022-10-22 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：拆墙板（全天）" },
	{ aid: 4, date: "2022-11-11 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：采购厨房用品（全天）" },
	{ aid: 4, date: "2022-11-12 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：打美缝胶（全天）" },
	{ aid: 4, date: "2022-11-13 20:00", uid: "杨然福", op: "work", msg: "本日工作内容：安装油烟机，包快递（全天）" },
]
const work: Work[] = activity.map(a => {
	const uid = uid_by_name.get(a.uid)!
	const op = a.op as "work" | "video"
	const utc = new Date(a.date).getTime()
	const _id = { aid: a.aid, utc: op === "work" ? rand_utc(utc) : utc }
	switch (op) {
		case "work": return { _id, uid, op, msg: a.msg! }
		case "video": return { _id, uid, op, title: a.title!, src: a.src! }
	}
})
Deno.writeTextFileSync("dbimport/work.json", JSON.stringify(work))

