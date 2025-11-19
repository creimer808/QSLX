import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        callsign: z.string().min(1),
        date: z.date(),
        frequency: z.number().optional(),
        mode: z.string().optional(),
        band: z.string().optional(),
        signalType: z.string().optional(),
        pathType: z.string().optional(),
        rstSent: z.string().optional(),
        rstReceived: z.string().optional(),
        gridSquare: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.contact.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { date: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.contact.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        callsign: z.string().min(1).optional(),
        date: z.date().optional(),
        frequency: z.number().optional(),
        mode: z.string().optional(),
        band: z.string().optional(),
        signalType: z.string().optional(),
        pathType: z.string().optional(),
        rstSent: z.string().optional(),
        rstReceived: z.string().optional(),
        gridSquare: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.contact.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const contacts = await ctx.db.contact.findMany({
      where: { userId: ctx.session.user.id },
    });

    const totalContacts = contacts.length;
    const uniqueCallsigns = new Set(contacts.map((c) => c.callsign)).size;
    const uniqueCountries = new Set(
      contacts.filter((c) => c.country).map((c) => c.country)
    ).size;

    // Band distribution
    const bandCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      if (c.band) {
        bandCounts[c.band] = (bandCounts[c.band] ?? 0) + 1;
      }
    });

    // Mode distribution
    const modeCounts: Record<string, number> = {};
    contacts.forEach((c) => {
      if (c.mode) {
        modeCounts[c.mode] = (modeCounts[c.mode] ?? 0) + 1;
      }
    });

    // Frequency distribution (group by MHz ranges)
    const frequencyRanges: Record<string, number> = {};
    contacts.forEach((c) => {
      if (c.frequency) {
        const range = `${Math.floor(c.frequency)}MHz`;
        frequencyRanges[range] = (frequencyRanges[range] ?? 0) + 1;
      }
    });

    // Contacts by date (for calendar/heatmap)
    const contactsByDate: Record<string, number> = {};
    contacts.forEach((c) => {
      const dateKey = c.date.toISOString().split("T")[0] ?? "";
      contactsByDate[dateKey] = (contactsByDate[dateKey] ?? 0) + 1;
    });

    return {
      totalContacts,
      uniqueCallsigns,
      uniqueCountries,
      bandCounts,
      modeCounts,
      frequencyRanges,
      contactsByDate,
    };
  }),

  getMapData: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.contact.findMany({
      where: {
        userId: ctx.session.user.id,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        callsign: true,
        date: true,
        latitude: true,
        longitude: true,
        country: true,
        band: true,
        mode: true,
      },
    });
  }),
});

