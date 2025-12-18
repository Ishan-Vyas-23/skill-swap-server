require("dotenv").config();
const mongoose = require("mongoose");

const Swap = require("../models/swap");
const { ensureConversation } = require("../services/conversationService");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_SKILLSWAP, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected");

    const acceptedSwaps = await Swap.find({ status: "accepted" });

    console.log(`Found ${acceptedSwaps.length} accepted swaps`);

    for (const swap of acceptedSwaps) {
      if (!swap.initiatorID || !swap.targetID) continue;

      await ensureConversation(
        swap.initiatorID.toString(),
        swap.targetID.toString()
      );
    }

    console.log("Backfill complete 🎉");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
