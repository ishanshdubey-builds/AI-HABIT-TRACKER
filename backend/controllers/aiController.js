
import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import AIInsight from "../models/AIInsight.js";
import { chatCompletion, SYSTEM_PROMPTS, parseJSON } from "../utils/aiService.js";
import { lastNDays, calcStreak, todayKey } from "../utils/dateHelpers.js";

// Build context for the weekly report
const buildWeeklyContext = async (userId) => {
  const habits = await Habit.find({
    userId,
    isArchived: false,
  });

  const days = lastNDays(7);

  const logs = await HabitLog.find({
    userId,
    completedDate: {
      $gte: days[0],
      $lte: days[days.length - 1],
    },
  });

  const perHabit = habits.map((habit) => {
    const completed = logs.filter(
      (log) => String(log.habitId) === String(habit._id)
    ).length;

    return {
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      completedDays: completed,
      targetDays: habit.targetDays,
    };
  });

  return { days, perHabit };
};

// 1. Generate weekly AI report
export const weeklyReport = async (req, res) => {
  try {
    const ctx = await buildWeeklyContext(req.user._id);

    if (!ctx.perHabit.length) {
      return res.json({
        content:
          "You don't have any active habits yet. Create your first habit to start tracking.",
      });
    }

    const userMsg = `Here is the user's habit data for the past 7 days
(${ctx.days[0]} to ${ctx.days[6]}):

${ctx.perHabit
  .map(
    (habit) =>
      `- ${habit.name} (${habit.category}, ${habit.frequency}): completed ${habit.completedDays} days out of 7; weekly target ${habit.targetDays} days`
  )
  .join("\n")}

Write a personalized weekly report. Use only the supplied data.`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.weekly,
      user: userMsg,
    });

    if (!result.ok) {
      console.error("Weekly report generation failed:", result.error);

      return res.status(502).json({
        message: result.content || "Could not generate the weekly report.",
      });
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "weekly",
      content: result.content,
    });

    return res.json({ content: result.content });
  } catch (err) {
    console.error("Weekly report controller error:", err);

    return res.status(500).json({
      message: "An error occurred while generating the weekly report.",
    });
  }
};

// 2. Suggest personalized habits
export const suggestHabits = async (req, res) => {
  try {
    const { goals, productiveTime, struggles } = req.body;

    const userMsg = `User goals: ${goals || "not provided"}
Most productive time: ${productiveTime || "not provided"}
Past struggles: ${struggles || "not provided"}

Suggest exactly 3 personalized habits. Return JSON only.`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.suggestion,
      user: userMsg,
    });

    if (!result.ok) {
      return res.status(502).json({
        message: result.content || "Could not generate habit suggestions.",
      });
    }

    let suggestions = [];

    try {
      const parsed = parseJSON(result.content);
      suggestions = parsed.suggestions || [];
    } catch (error) {
      console.error("Could not parse habit suggestions:", error.message);
    }

    if (!suggestions.length) {
      suggestions = [
        {
          name: "10-minute morning walk",
          description: "Start the day with light movement and fresh air.",
          frequency: "daily",
          category: "Fitness",
          icon: "🚶",
          reason: "A simple way to build consistency.",
        },
        {
          name: "Read 5 pages",
          description: "Read a few pages of a book each day.",
          frequency: "daily",
          category: "Learning",
          icon: "📚",
          reason: "Small reading sessions build a lasting learning habit.",
        },
        {
          name: "2 minutes of mindful breathing",
          description: "Pause and breathe to reset your focus.",
          frequency: "daily",
          category: "Mindfulness",
          icon: "🌿",
          reason: "A short practice that fits into a busy schedule.",
        },
      ];
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "suggestion",
      content: JSON.stringify(suggestions),
      meta: { goals, productiveTime, struggles },
    });

    return res.json({ suggestions });
  } catch (err) {
    console.error("Habit suggestion error:", err);

    return res.status(500).json({
      message: "An error occurred while generating habit suggestions.",
    });
  }
};

// 3. Generate a three-day recovery plan
export const recoveryPlan = async (req, res) => {
  try {
    const { habitId } = req.body;

    if (!habitId) {
      return res.status(400).json({
        message: "habitId is required.",
      });
    }

    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found.",
      });
    }

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId,
    }).sort({ completedDate: -1 });

    const keys = logs.map((log) => log.completedDate);
    const { current, longest } = calcStreak(keys);

    const userMsg = `Habit: ${habit.name} (${habit.category}).
Description: ${habit.description || "none"}.
Current streak: ${current} days.
Longest streak: ${longest} days.

Write a warm, actionable three-day recovery plan.`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.recovery,
      user: userMsg,
    });

    if (!result.ok) {
      return res.status(502).json({
        message: result.content || "Could not generate the recovery plan.",
      });
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "recovery",
      content: result.content,
      meta: { habitId },
    });

    return res.json({ content: result.content });
  } catch (err) {
    console.error("Recovery plan error:", err);

    return res.status(500).json({
      message: "An error occurred while generating the recovery plan.",
    });
  }
};

// 4. Answer questions about habit history
export const chatAnalysis = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required.",
      });
    }

    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    const days = lastNDays(30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: {
        $gte: days[0],
        $lte: days[days.length - 1],
      },
    });

    const context = habits
      .map((habit) => {
        const habitLogs = logs.filter(
          (log) => String(log.habitId) === String(habit._id)
        );

        const byDow = [0, 0, 0, 0, 0, 0, 0];

        for (const log of habitLogs) {
          const dow = new Date(log.completedDate).getDay();
          byDow[dow] += 1;
        }

        return `${habit.name} (${habit.category}): completed ${habitLogs.length} times in the last 30 days. By weekday [Sun, Mon, Tue, Wed, Thu, Fri, Sat]: ${byDow.join(", ")}`;
      })
      .join("\n");

    const userMsg = `User question: "${question}"

User habit data for the last 30 days:
${context || "No habit data available."}

Answer the question using only this data.`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.chat,
      user: userMsg,
    });

    if (!result.ok) {
      return res.status(502).json({
        message: result.content || "Could not analyze your habit data.",
      });
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "chat",
      content: result.content,
      meta: { question },
    });

    return res.json({ content: result.content });
  } catch (err) {
    console.error("Habit analysis error:", err);

    return res.status(500).json({
      message: "An error occurred while analyzing your habit data.",
    });
  }
};

// 5. Generate personalized morning motivation
export const morningMotivation = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });

    if (!habits.length) {
      return res.json({
        content:
          "Good morning! Add your first habit today and let's get the momentum started.",
      });
    }

    const days = lastNDays(30);

    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: {
        $gte: days[0],
        $lte: days[days.length - 1],
      },
    });

    const context = habits
      .map((habit) => {
        const habitLogs = logs
          .filter((log) => String(log.habitId) === String(habit._id))
          .map((log) => log.completedDate)
          .sort()
          .reverse();

        const { current } = calcStreak(habitLogs);

        return `${habit.name}: current streak ${current}`;
      })
      .join("\n");

    const today = todayKey();

    const todayLogs = logs.filter(
      (log) => log.completedDate === today
    );

    const done = todayLogs.length;
    const total = habits.length;

    const userMsg = `Today's habits and streaks:
${context}

Completed today: ${done}/${total}.
Write a personalized morning message.`;

    const result = await chatCompletion({
      system: SYSTEM_PROMPTS.morning,
      user: userMsg,
      temperature: 0.8,
    });

    if (!result.ok) {
      return res.status(502).json({
        message: result.content || "Could not generate morning motivation.",
      });
    }

    await AIInsight.create({
      userId: req.user._id,
      type: "morning",
      content: result.content,
    });

    return res.json({ content: result.content });
  } catch (err) {
    console.error("Morning motivation error:", err);

    return res.status(500).json({
      message: "An error occurred while generating morning motivation.",
    });
  }
};












// import Habit from "../models/Habit.js";
// import HabitLog from "../models/HabitLog.js";
// import AIInsight from "../models/AIInsight.js";
// import { chatCompletion, SYSTEM_PROMPTS } from "../utils/aiService.js";
// import { lastNDays, calcStreak, todayKey } from "../utils/dateHelpers.js";

// const buildWeeklyContext = async (userId) => { I
// const habitsv= await Habit.find({ userId, isArchived: false });
// const days = lastNDays (7); 
// const logsv= await HabitLog.find({
// userId,
// completedDate: { $gte: days [0], $lte: days [days.length - 1] },
// });
// const perHabit = habits.map((h) => {
// const completed = logs.filter(
// (l) => String (l.habitId) === String (h._id)
// ).length;
// return {
// name: h.name,
// category: h.category,
// frequency: h.frequency,
// completedDays: completed,
// targetDays: h.targetDays,
// };
// });
// return { days, perHabit };
// };

// export const weeklyReport = async (req, res) => {
//   try {
//     const ctx = await buildWeeklyContext(req.user._id);

//     if (!ctx.perHabit.length) {
//       return res.json({
//         content:
//           "You don't have any active habits yet. Create your first habit to start tracking — I'll generate a weekly report once you have some data.",
//       });
//     }

//     const userMsg = `Here is the user's habit data for the past 7 days (${ctx.days[0]} to ${ctx.days[6]}):

// ${ctx.perHabit
//   .map(
//     (h) =>
//       `- ${h.name} (${h.category}, ${h.frequency}): completed ${h.completedDays} of the past 7 days, target ${h.targetDays}/week`
//   )
//   .join("\n")}

// Please write the personalised weekly report now.`;

//     const { content } = await chatCompletion({
//       system: SYSTEM_PROMPTS.weekly,
//       user: userMsg,
//     });

//     await AIInsight.create({
//       userId: req.user._id,
//       type: "weekly",
//       content,
//     });

//     res.json({ content });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const suggestHabits = async (req, res) => {
// try {
// const { goals, productiveTime, struggles } = req.body;
// const userMsg = `User goals: $(goals || "not provided"}\nMost productive time: ${productiveTime || "not provide"}\nPast struggles: ${struggles || "not provide"}\n\nSuggest 3 personalised habits now. Return JSON only.`;
// const { content } = await chatCompletion({
// system: SYSTEM_PROMPTS.suggestion,
// user: userMsg,
// });
// let suggestions = [];
// try{
// const parsed = JSON.parse(content.replace(```json```/g, "").trim());
// suggestions = parsed.suggestions || [];
// } catch {
// suggestions = [];
// }
// if (!suggestions.length) {
// suggestions = [
// {
// name: "10-minute morning walk",
// description: "Start the day with light movement and fresh air.",
// frequency: "daily",
// category: "Fitness",
// icon: "",
// reason: "Low-friction way to build consistency early in the day.",
// },
// {
// name: "Read 5 pages",
// description: "Short daily reading to build a learning routine.",
// frequency: "daily",
// category: "Learning",
// icon: "", 
// reason: "Compounds into significant knowledge over weeks.",
// },
// {
// name: "2 minutes of mindful breathing",
// description: "Pause and breathe to reset focus and reduce stress.",
// frequency: "daily",
// category: "Mindfulness",
// icon: "",
// reason: "Tiny anchor habit that fits any schedule.",
// },
// ];
// }

// await AIInsight.create({
// userId: req.user._id,
// type: "suggestion",
// content: JSON.stringify(suggestions),
// meta: { goals, productiveTime, struggles },
// });
// res.json({ suggestions });
// } catch (err) {
//     res.status(500).json({ message: err.message });
// }
// };

// export const recoveryPlan = async (req, res) => {
// try {
// const { HabitId } = req.body;
// const habit = await Habit.findOne({
// _id: habitId,
// userId: req.user._id,
// });
// if (!habit) return res.status(404).json({ message: "Habit not found" });

// const logs = await HabitLog.find({
// userId: req.user._id,
// habitId,
// }).sort({ completedDate: -1});
// const keys = logs.map((l) => l.completedDate);
// const { current, longest } = calcStreak (keys);

// const userMsg = `Habit: ${habit.name} (${habit.category}).\nDescription: ${habit.description || "none"}.\nCurrent streak: ${current} days. Longest ever: ${longest} days. The user just broke a streak. Write a warm, actionable 3-day recovery plan.`; 

// const { content } = await chatCompletion({
// system: SYSTEM_PROMPTS.recovery,
// user: userMsg,
// });

// await AlInsight.create({
// userId: req.user._id,
// type: "recovery",
// content,
// meta: { habitId},
// });
// res.json({ content });
// } catch (err) {
// res.status(500).json({ message: err.message });
// }
// };

// export const chatAnalysis = async (req, res) => {
// try {
// const { question } = req.body;
// if (!question)
// return res.status(400).json({ message: "Question is required" });
// const habits = await Habit.find({
// userId: req.user._id,
// isArchived: false,
// });
// const days = lastNDays (30);
// const logs = await HabitLog.find({
// userId: req.user._id,
//  completedDate: { $gte: days [0], $lte: days [days.length - 1]},
//  });
// const context = habits
// .map((h) => {
// const hLogs = logs.filter(
// ); (l) => String (l.habitId) === String(h._id)
// const byDow = [0, 0, 0, 0, 0, 0, 0];
// for (const l of hLogs) {
// const dow = new Date(l.completedDate).getDay();
// byDow[dow] += 1;
// }
// return `${h.name} (${h.category}): ${hLogs.length}/30 in last 30 days, by weekday [Sun, Mon, Tue, Wed, Thu, Fri, Sat] ${byDow}`;
// })
// .join("\n");
// const userMsg = `User question: "${question}"\n\nUser data (last 30 days):\n${context}\n\nAnswer now.`;
// const { content } = await chatCompletion({
// system: SYSTEM_PROMPTS.chat,
// user: userMsg,
// });
// await AIInsight.create({
// userId: req.user._id,
// type: "chat",
// content,
// meta: { question },
// });
// res.json({ content });
// } catch (err) {
// res.status(500).json({ message: err.message });
// }
// };
// export const morningMotivation = async (req, res) => {
// try {
// const habits = await Habit.find({
// userId: req.user._id,
// isArchived: false,
// });
// if (!habits.length) {
// }
// return res.json({
// content:
// "Good morning! Add your first habit today and let's get the momentum started.",
// });
// const days = lastNDays (30);
// const logs = await HabitLog.find({
//   userId: req.user._id,
//   completedDate: {
//     $gte: days[0],
//     $lte: days[days.length - 1],
//   },
// });
// const ctx = habits
// .map((h) => {
// const hLogs = logs
// .filter((l) => String(l.habitId) === String(h._id))
// .map((l) => l.completedDate)
// .sort()
// .reverse();

// const { current} = calcStreak (hLogs);

// return `${h.name}: current streak ${current}`;
// })
// .join("\n");
// const today = todayKey();
// const todayLogs = logs.filter((l) => l.completedDate === today);
// const done = todayLogs.length;
// const total = habits.length;
// const userMsg = `Today's habits and streaks:\n${ctx}\n\nDone today: $(done)/${total}. Write the morning message`;

// const { content } = await chatCompletion({
// system: SYSTEM_PROMPTS.morning,
// user: userMsg,
// temperature: 0.8,
// });

// await AIInsight.create({
// userId: req.user._id,
// type: "morning",
// content,
// });

// res.json({ content});
// } catch (err) {
//  res.status(500).json({ message: err.message});
// }
// };