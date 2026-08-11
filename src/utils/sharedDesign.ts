export const getBeadStoneRecord = (beads: (string | null)[]) =>
    beads.reduce<Record<number, string>>((record, stoneId, index) => {
        if (stoneId) record[index] = stoneId;
        return record;
    }, {});
