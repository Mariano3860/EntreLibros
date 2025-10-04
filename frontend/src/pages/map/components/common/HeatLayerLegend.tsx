import styles from './HeatLayerLegend.module.scss'

type HeatLayerLegendProps = {
  label: string
}

export const HeatLayerLegend = ({ label }: HeatLayerLegendProps) => {
  return (
    <div className={styles.legend} aria-hidden="true">
      <div className={styles.scale} />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
