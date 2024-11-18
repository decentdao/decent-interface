// const createRoleTermViewProps = (hatId: Hex) => {
//   const roleHat = useMemo(() => {
//     if (!hatId) return undefined;
//     return getHat(hatId);
//   }, [getHat, hatId]);
// };

// const termPosition = useMemo(() => {
//   const currentTermEndDate = roleHat.roleTerms.currentTerm?.termEndDate;
//   const nextTermEndDate = roleHat.roleTerms.nextTerm?.termEndDate;
//   if (currentTermEndDate && termEndDate.getTime() === currentTermEndDate.getTime())
//     return 'currentTerm';
//   if (nextTermEndDate && termEndDate.getTime() === nextTermEndDate.getTime()) return 'nextTerm';
// }, [roleHat, termEndDate]);

// const [currentTerm, previousTerm] = roleHat.roleTerms.allTerms.sort(
//   (a, b) => a.termNumber - b.termNumber,
// );
