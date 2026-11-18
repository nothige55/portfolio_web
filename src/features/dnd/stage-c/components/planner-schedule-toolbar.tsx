// 목록 위에 고정되는 조작 줄
// trego-web-portfolio planner-schedule-toolbar.tsx에서 가져옴
// 수정: 데모에는 실행 취소·다시 실행·일정 추가·모두 접기 command가 없어 버튼은 뺐다.
// breadcrumb가 이 막대 바로 아래(top 32px)에 붙으므로 막대 자체와 "일정" 제목은 남긴다

export function PlannerScheduleToolbar() {
  return (
    <div className="absolute inset-x-0 top-0 z-50 flex h-8 items-center justify-between bg-card px-6 pr-2 text-sm font-medium">
      <span>일정</span>
    </div>
  );
}
