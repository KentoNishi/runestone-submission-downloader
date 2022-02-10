interface HistoryResponse {
  detail: {
    acid: string;
    sid: string;
    history: string[],
    timestamps: string[],
  }
}
