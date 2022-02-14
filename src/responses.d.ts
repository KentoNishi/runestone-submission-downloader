interface HistoryResponse {
  detail: {
    acid: string;
    sid: string;
    history: string[],
    timestamps: string[],
  }
}

interface GradeResponse {
  comments: string;
  grade: number;
}
